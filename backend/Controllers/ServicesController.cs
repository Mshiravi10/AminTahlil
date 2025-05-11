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
    public class ServicesController : ControllerBase
    {
        private readonly ITraceService _traceService;
        private readonly ILogger<ServicesController> _logger;

        public ServicesController(ITraceService traceService, ILogger<ServicesController> logger)
        {
            _traceService = traceService ?? throw new ArgumentNullException(nameof(traceService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get all known services
        /// </summary>
        /// <returns>A list of service names</returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<string>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetServices()
        {
            try
            {
                _logger.LogInformation("Getting all services");
                var services = await _traceService.GetServicesAsync();
                return Ok(services);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting services");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving services");
            }
        }

        /// <summary>
        /// Get all operations for a service
        /// </summary>
        /// <param name="service">The service name</param>
        /// <returns>A list of operation names</returns>
        [HttpGet("{service}/operations")]
        [ProducesResponseType(typeof(List<string>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetOperations(string service)
        {
            try
            {
                _logger.LogInformation($"Getting operations for service: {service}");
                var operations = await _traceService.GetOperationsAsync(service);
                return Ok(operations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting operations for service {service}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving operations");
            }
        }

        /// <summary>
        /// Get detailed insights for a specific service
        /// </summary>
        /// <param name="service">The service name</param>
        /// <param name="timeRangeHours">Time range in hours to analyze (default: 24 hours)</param>
        /// <param name="maxTraces">Maximum number of recent traces to return (default: 10)</param>
        /// <returns>Detailed statistics and insights for the service</returns>
        [HttpGet("{service}/insights")]
        [ProducesResponseType(typeof(ServiceInsightsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetServiceInsights(string service, [FromQuery] int timeRangeHours = 24, [FromQuery] int maxTraces = 10)
        {
            try
            {
                _logger.LogInformation($"Getting insights for service: {service}");

                // Check if service exists
                var services = await _traceService.GetServicesAsync();
                if (!services.Contains(service))
                {
                    return NotFound($"Service '{service}' not found");
                }

                // Get operations for the service
                var operations = await _traceService.GetOperationsAsync(service);

                // Get traces involving this service
                var parameters = new TraceSearchParameters
                {
                    Service = service,
                    StartTimeMin = DateTime.UtcNow.AddHours(-timeRangeHours),
                    Limit = 100 // Get enough traces for meaningful statistics
                };

                var traces = await _traceService.SearchTracesAsync(parameters);

                // Calculate operation statistics
                var operationStats = new List<OperationStatistics>();
                foreach (var operation in operations)
                {
                    // Filter spans for this operation
                    var relevantSpans = traces
                        .SelectMany(t => t.Spans)
                        .Where(s => s.ServiceName == service && s.OperationName == operation)
                        .ToList();

                    if (relevantSpans.Any())
                    {
                        var stats = new OperationStatistics
                        {
                            OperationName = operation,
                            Count = relevantSpans.Count,
                            AverageDuration = relevantSpans.Average(s => s.Duration.TotalMilliseconds),
                            MaxDuration = relevantSpans.Max(s => s.Duration.TotalMilliseconds),
                            ErrorCount = relevantSpans.Count(s => s.HasError)
                        };

                        operationStats.Add(stats);
                    }
                    else
                    {
                        // Add operation with zero stats if no spans found
                        operationStats.Add(new OperationStatistics { OperationName = operation });
                    }
                }

                // Calculate overall service statistics
                var serviceSpans = traces
                    .SelectMany(t => t.Spans)
                    .Where(s => s.ServiceName == service)
                    .ToList();

                var errorTraces = traces.Where(t => t.HasError).ToList();

                // Build the response
                var response = new ServiceInsightsResponse
                {
                    ServiceName = service,
                    OperationCount = operations.Count,
                    TraceCount = traces.Count,
                    ErrorCount = errorTraces.Count,
                    ErrorPercentage = traces.Count > 0 ? (double)errorTraces.Count / traces.Count * 100 : 0,
                    AverageSpanDuration = serviceSpans.Any() ? serviceSpans.Average(s => s.Duration.TotalMilliseconds) : 0,
                    OperationStats = operationStats.OrderByDescending(s => s.AverageDuration).ToList(),
                    RecentTraces = traces.OrderByDescending(t => t.StartTime).Take(maxTraces).ToList()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting insights for service {service}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving service insights");
            }
        }
    }
}
