using AminTahlil.Api.Models;
using AminTahlil.Api.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AminTahlil.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComparisonController : ControllerBase
    {
        private readonly ITraceService _traceService;
        private readonly ILogger<ComparisonController> _logger;

        public ComparisonController(ITraceService traceService, ILogger<ComparisonController> logger)
        {
            _traceService = traceService ?? throw new ArgumentNullException(nameof(traceService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Compare two or more traces
        /// </summary>
        /// <param name="traceIds">List of trace IDs to compare</param>
        /// <returns>Comparison results for the specified traces</returns>
        [HttpPost("traces")]
        [ProducesResponseType(typeof(TraceComparisonResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CompareTraces([FromBody] TraceComparisonRequest request)
        {
            try
            {
                if (request?.TraceIds == null || request.TraceIds.Count < 2)
                {
                    return BadRequest("At least two trace IDs are required for comparison");
                }

                _logger.LogInformation($"Comparing {request.TraceIds.Count} traces");
                
                // Get all traces
                var traces = new List<Trace>();
                foreach (var traceId in request.TraceIds)
                {
                    var trace = await _traceService.GetTraceAsync(traceId);
                    if (trace != null)
                    {
                        traces.Add(trace);
                    }
                    else
                    {
                        _logger.LogWarning($"Trace {traceId} not found");
                    }
                }
                
                if (traces.Count < 2)
                {
                    return BadRequest("At least two valid traces are required for comparison");
                }
                
                // Build comparison result
                var result = new TraceComparisonResult
                {
                    Traces = traces,
                    CommonServices = GetCommonServices(traces),
                    CommonOperations = GetCommonOperations(traces),
                    ServiceComparison = CompareServices(traces),
                    OperationComparison = CompareOperations(traces),
                    DurationComparison = CompareDurations(traces)
                };
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error comparing traces");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while comparing traces");
            }
        }
        
        private List<string> GetCommonServices(List<Trace> traces)
        {
            // Get services that appear in all traces
            var serviceGroups = traces
                .Select(t => t.Spans
                    .Select(s => s.ServiceName)
                    .Distinct()
                    .ToList())
                .ToList();
                
            return serviceGroups
                .Skip(1)
                .Aggregate(
                    new HashSet<string>(serviceGroups.First()),
                    (h, services) => { h.IntersectWith(services); return h; }
                )
                .ToList();
        }
        
        private List<string> GetCommonOperations(List<Trace> traces)
        {
            // Get operations that appear in all traces
            var operationGroups = traces
                .Select(t => t.Spans
                    .Select(s => $"{s.ServiceName}:{s.OperationName}")
                    .Distinct()
                    .ToList())
                .ToList();
                
            return operationGroups
                .Skip(1)
                .Aggregate(
                    new HashSet<string>(operationGroups.First()),
                    (h, operations) => { h.IntersectWith(operations); return h; }
                )
                .ToList();
        }
        
        private List<ServiceComparisonItem> CompareServices(List<Trace> traces)
        {
            // Compare service durations across traces
            var allServices = traces
                .SelectMany(t => t.Spans.Select(s => s.ServiceName))
                .Distinct()
                .ToList();
                
            var result = new List<ServiceComparisonItem>();
            
            foreach (var service in allServices)
            {
                var item = new ServiceComparisonItem
                {
                    ServiceName = service,
                    TraceDurations = new List<ServiceTraceDuration>()
                };
                
                foreach (var trace in traces)
                {
                    var serviceSpans = trace.Spans.Where(s => s.ServiceName == service).ToList();
                    
                    if (serviceSpans.Any())
                    {
                        var totalDuration = serviceSpans.Sum(s => s.Duration.TotalMilliseconds);
                        var spanCount = serviceSpans.Count;
                        var hasError = serviceSpans.Any(s => s.HasError);
                        
                        item.TraceDurations.Add(new ServiceTraceDuration
                        {
                            TraceId = trace.TraceId,
                            TotalDuration = totalDuration,
                            SpanCount = spanCount,
                            HasError = hasError
                        });
                    }
                    else
                    {
                        item.TraceDurations.Add(new ServiceTraceDuration
                        {
                            TraceId = trace.TraceId,
                            TotalDuration = 0,
                            SpanCount = 0,
                            HasError = false
                        });
                    }
                }
                
                result.Add(item);
            }
            
            return result;
        }
        
        private List<OperationComparisonItem> CompareOperations(List<Trace> traces)
        {
            // Compare operation durations across traces
            var allOperations = traces
                .SelectMany(t => t.Spans.Select(s => new { Service = s.ServiceName, Operation = s.OperationName }))
                .GroupBy(o => new { o.Service, o.Operation })
                .Select(g => g.Key)
                .ToList();
                
            var result = new List<OperationComparisonItem>();
            
            foreach (var op in allOperations)
            {
                var item = new OperationComparisonItem
                {
                    ServiceName = op.Service,
                    OperationName = op.Operation,
                    TraceDurations = new List<OperationTraceDuration>()
                };
                
                foreach (var trace in traces)
                {
                    var operationSpans = trace.Spans
                        .Where(s => s.ServiceName == op.Service && s.OperationName == op.Operation)
                        .ToList();
                    
                    if (operationSpans.Any())
                    {
                        var avgDuration = operationSpans.Average(s => s.Duration.TotalMilliseconds);
                        var maxDuration = operationSpans.Max(s => s.Duration.TotalMilliseconds);
                        var spanCount = operationSpans.Count;
                        var hasError = operationSpans.Any(s => s.HasError);
                        
                        item.TraceDurations.Add(new OperationTraceDuration
                        {
                            TraceId = trace.TraceId,
                            AverageDuration = avgDuration,
                            MaxDuration = maxDuration,
                            SpanCount = spanCount,
                            HasError = hasError
                        });
                    }
                    else
                    {
                        item.TraceDurations.Add(new OperationTraceDuration
                        {
                            TraceId = trace.TraceId,
                            AverageDuration = 0,
                            MaxDuration = 0,
                            SpanCount = 0,
                            HasError = false
                        });
                    }
                }
                
                result.Add(item);
            }
            
            return result;
        }
        
        private TraceDurationComparison CompareDurations(List<Trace> traces)
        {
            // Overall duration comparison
            return new TraceDurationComparison
            {
                TraceDurations = traces.Select(t => new TraceDurationItem
                {
                    TraceId = t.TraceId,
                    StartTime = t.StartTime,
                    EndTime = t.EndTime,
                    Duration = t.Duration.TotalMilliseconds,
                    SpanCount = t.Spans.Count,
                    ServiceCount = t.Spans.Select(s => s.ServiceName).Distinct().Count(),
                    HasError = t.HasError
                }).ToList()
            };
        }
    }
}
