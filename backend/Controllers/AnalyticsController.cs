using AminTahlil.Api.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace AminTahlil.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly ITraceService _traceService;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(ITraceService traceService, ILogger<AnalyticsController> logger)
        {
            _traceService = traceService ?? throw new ArgumentNullException(nameof(traceService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get top recent error traces
        /// </summary>
        /// <param name="limit">Maximum number of traces to return</param>
        /// <returns>A list of error traces</returns>
        [HttpGet("errors")]
        [ProducesResponseType(typeof(List<Trace>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetErrorTraces([FromQuery] int limit = 10)
        {
            try
            {
                _logger.LogInformation($"Getting {limit} error traces");
                var traces = await _traceService.GetErrorTracesAsync(limit);
                return Ok(traces);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting error traces");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving error traces");
            }
        }

        /// <summary>
        /// Get top slow spans with duration metadata
        /// </summary>
        /// <param name="limit">Maximum number of spans to return</param>
        /// <returns>A list of slow spans</returns>
        [HttpGet("slow-spans")]
        [ProducesResponseType(typeof(List<Span>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetSlowSpans([FromQuery] int limit = 10)
        {
            try
            {
                _logger.LogInformation($"Getting {limit} slow spans");
                var spans = await _traceService.GetSlowSpansAsync(limit);
                return Ok(spans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting slow spans");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving slow spans");
            }
        }

        /// <summary>
        /// Get microservice communication graph
        /// </summary>
        /// <returns>A service map with nodes and edges</returns>
        [HttpGet("service-map")]
        [ProducesResponseType(typeof(ServiceMap), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetServiceMap()
        {
            try
            {
                _logger.LogInformation("Getting service map");
                var serviceMap = await _traceService.GetServiceMapAsync();
                return Ok(serviceMap);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting service map");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving service map");
            }
        }
    }
}
