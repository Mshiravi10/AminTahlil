using AminTahlil.Api.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AminTahlil.Api.Services
{
    public class TraceService : ITraceService
    {
        private readonly IJaegerClient _jaegerClient;
        private readonly ILogger<TraceService> _logger;

        public TraceService(IJaegerClient jaegerClient, ILogger<TraceService> logger)
        {
            _jaegerClient = jaegerClient ?? throw new ArgumentNullException(nameof(jaegerClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Trace> GetTraceAsync(string traceId)
        {
            try
            {
                _logger.LogInformation($"Getting trace with ID: {traceId}");
                var jaegerResponse = await _jaegerClient.GetTraceAsync(traceId);
                
                if (jaegerResponse.Data.Count == 0)
                {
                    _logger.LogWarning($"No trace found with ID: {traceId}");
                    return null;
                }
                
                var jaegerTrace = jaegerResponse.Data[0];
                return ConvertToTrace(jaegerTrace);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting trace {traceId}");
                throw;
            }
        }

        public async Task<List<Trace>> SearchTracesAsync(TraceSearchParameters parameters)
        {
            try
            {
                _logger.LogInformation($"Searching traces with parameters: {parameters.Service}, {parameters.Operation}");
                var jaegerResponse = await _jaegerClient.SearchTracesAsync(parameters);
                
                return jaegerResponse.Data
                    .Select(ConvertToTrace)
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching traces");
                throw;
            }
        }

        public async Task<List<string>> GetServicesAsync()
        {
            try
            {
                return await _jaegerClient.GetServicesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting services");
                throw;
            }
        }

        public async Task<List<string>> GetOperationsAsync(string service)
        {
            try
            {
                return await _jaegerClient.GetOperationsAsync(service);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting operations for service {service}");
                throw;
            }
        }

        public async Task<List<Trace>> GetErrorTracesAsync(int limit = 10)
        {
            try
            {
                _logger.LogInformation($"Getting {limit} error traces");
                
                // Search for traces with error tag
                var parameters = new TraceSearchParameters
                {
                    Tags = "error=true",
                    Limit = limit,
                    StartTimeMin = DateTime.UtcNow.AddDays(-7) // Last week
                };
                
                return await SearchTracesAsync(parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting error traces");
                throw;
            }
        }

        public async Task<List<Span>> GetSlowSpansAsync(int limit = 10)
        {
            try
            {
                _logger.LogInformation($"Getting {limit} slow spans");
                
                // Get traces with high duration
                var parameters = new TraceSearchParameters
                {
                    MinDuration = 1000000, // 1 second in microseconds
                    Limit = limit * 2, // Get more traces to find the slowest spans
                    StartTimeMin = DateTime.UtcNow.AddDays(-7) // Last week
                };
                
                var traces = await SearchTracesAsync(parameters);
                
                // Extract all spans, sort by duration and take the limit
                return traces
                    .SelectMany(t => t.Spans)
                    .OrderByDescending(s => s.Duration)
                    .Take(limit)
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting slow spans");
                throw;
            }
        }

        public async Task<ServiceMap> GetServiceMapAsync()
        {
            try
            {
                _logger.LogInformation("Generating service map");
                
                // Get recent traces to build the service map
                var parameters = new TraceSearchParameters
                {
                    Limit = 100,
                    StartTimeMin = DateTime.UtcNow.AddDays(-1) // Last 24 hours
                };
                
                var traces = await SearchTracesAsync(parameters);
                var serviceMap = new ServiceMap();
                var serviceNodes = new Dictionary<string, ServiceMapNode>();
                var serviceEdges = new Dictionary<string, ServiceMapEdge>();
                
                foreach (var trace in traces)
                {
                    foreach (var span in trace.Spans)
                    {
                        // Add service node if not exists
                        if (!serviceNodes.ContainsKey(span.ServiceName))
                        {
                            serviceNodes[span.ServiceName] = new ServiceMapNode
                            {
                                Id = span.ServiceName,
                                ServiceName = span.ServiceName,
                                CallCount = 0,
                                AvgDuration = 0,
                                ErrorCount = 0
                            };
                        }
                        
                        // Update service node stats
                        var node = serviceNodes[span.ServiceName];
                        node.CallCount++;
                        node.AvgDuration = ((node.AvgDuration * (node.CallCount - 1)) + span.Duration.TotalMilliseconds) / node.CallCount;
                        
                        if (span.HasError)
                        {
                            node.ErrorCount++;
                        }
                        
                        // If span has a parent, add an edge between services
                        var parentSpan = trace.Spans.FirstOrDefault(s => s.SpanId == span.ParentSpanId);
                        if (parentSpan != null && parentSpan.ServiceName != span.ServiceName)
                        {
                            var edgeKey = $"{parentSpan.ServiceName}:{span.ServiceName}";
                            
                            if (!serviceEdges.ContainsKey(edgeKey))
                            {
                                serviceEdges[edgeKey] = new ServiceMapEdge
                                {
                                    Source = parentSpan.ServiceName,
                                    Target = span.ServiceName,
                                    CallCount = 0,
                                    AvgDuration = 0,
                                    ErrorCount = 0,
                                    Operations = new List<string>()
                                };
                            }
                            
                            // Update edge stats
                            var edge = serviceEdges[edgeKey];
                            edge.CallCount++;
                            edge.AvgDuration = ((edge.AvgDuration * (edge.CallCount - 1)) + span.Duration.TotalMilliseconds) / edge.CallCount;
                            
                            if (span.HasError)
                            {
                                edge.ErrorCount++;
                            }
                            
                            if (!edge.Operations.Contains(span.OperationName))
                            {
                                edge.Operations.Add(span.OperationName);
                            }
                        }
                    }
                }
                
                // Build the service map
                serviceMap.Nodes = serviceNodes.Values.ToList();
                serviceMap.Edges = serviceEdges.Values.ToList();
                
                return serviceMap;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating service map");
                throw;
            }
        }

        private Trace ConvertToTrace(JaegerTrace jaegerTrace)
        {
            if (jaegerTrace == null) return null;
            
            var trace = new Trace
            {
                TraceId = jaegerTrace.TraceId,
                Spans = new List<Span>()
            };
            
            if (jaegerTrace.Spans.Count == 0)
            {
                return trace;
            }
            
            // Convert spans
            foreach (var jaegerSpan in jaegerTrace.Spans)
            {
                var serviceName = string.Empty;
                if (jaegerTrace.Processes.TryGetValue(jaegerSpan.ProcessId, out var process))
                {
                    serviceName = process.ServiceName;
                }
                
                // Find parent span ID
                string parentSpanId = null;
                var parentReference = jaegerSpan.References?.FirstOrDefault(r => r.RefType == "CHILD_OF");
                if (parentReference != null)
                {
                    parentSpanId = parentReference.SpanId;
                }
                
                // Convert tags to dictionary
                var tags = jaegerSpan.Tags?.ToDictionary(
                    t => t.Key,
                    t => t.Value)
                    ?? new Dictionary<string, object>();
                
                // Convert logs
                var logs = jaegerSpan.Logs?.Select(l => new Log
                {
                    Timestamp = l.Timestamp,
                    Fields = l.Fields?.ToDictionary(
                        f => f.Key,
                        f => f.Value)
                        ?? new Dictionary<string, object>()
                }).ToList() ?? new List<Log>();
                
                var span = new Span
                {
                    SpanId = jaegerSpan.SpanId,
                    ParentSpanId = parentSpanId,
                    TraceId = jaegerSpan.TraceId,
                    OperationName = jaegerSpan.OperationName,
                    ServiceName = serviceName,
                    StartTime = jaegerSpan.StartTime,
                    EndTime = jaegerSpan.EndTime,
                    Tags = tags,
                    Logs = logs
                };
                
                trace.Spans.Add(span);
            }
            
            // Set trace start and end times
            if (trace.Spans.Any())
            {
                trace.StartTime = trace.Spans.Min(s => s.StartTime);
                trace.EndTime = trace.Spans.Max(s => s.EndTime);
            }
            
            return trace;
        }
    }
}
