using AminTahlil.Api.Models;
using AminTahlil.Api.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace AminTahlil.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TracesController : ControllerBase
    {
        private readonly ITraceService _traceService;
        private readonly ILogger<TracesController> _logger;

        public TracesController(ITraceService traceService, ILogger<TracesController> logger)
        {
            _traceService = traceService ?? throw new ArgumentNullException(nameof(traceService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get a trace by its ID
        /// </summary>
        /// <param name="traceId">The ID of the trace to get</param>
        /// <returns>The full trace tree with all spans, metadata, tags, and logs</returns>
        [HttpGet("{traceId}")]
        [ProducesResponseType(typeof(Trace), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetTrace(string traceId)
        {
            try
            {
                _logger.LogInformation($"Getting trace with ID: {traceId}");
                var trace = await _traceService.GetTraceAsync(traceId);
                
                if (trace == null)
                {
                    return NotFound($"Trace with ID {traceId} not found");
                }
                
                return Ok(trace);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting trace {traceId}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving the trace");
            }
        }

        /// <summary>
        /// Search traces by various filters
        /// </summary>
        /// <param name="service">Service name filter</param>
        /// <param name="operation">Operation name filter</param>
        /// <param name="tags">Tags filter (format: key1=value1,key2=value2)</param>
        /// <param name="minDuration">Minimum duration in microseconds</param>
        /// <param name="maxDuration">Maximum duration in microseconds</param>
        /// <param name="startTimeMin">Minimum start time</param>
        /// <param name="startTimeMax">Maximum start time</param>
        /// <param name="limit">Maximum number of traces to return</param>
        /// <returns>A list of traces matching the filters</returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<Trace>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SearchTraces(
            [FromQuery] string service = null,
            [FromQuery] string operation = null,
            [FromQuery] string tags = null,
            [FromQuery] int? minDuration = null,
            [FromQuery] int? maxDuration = null,
            [FromQuery] DateTime? startTimeMin = null,
            [FromQuery] DateTime? startTimeMax = null,
            [FromQuery] int limit = 20)
        {
            try
            {
                _logger.LogInformation($"Searching traces with parameters: {service}, {operation}, {tags}");
                
                var parameters = new TraceSearchParameters
                {
                    Service = service,
                    Operation = operation,
                    Tags = tags,
                    MinDuration = minDuration,
                    MaxDuration = maxDuration,
                    StartTimeMin = startTimeMin,
                    StartTimeMax = startTimeMax,
                    Limit = limit
                };
                
                var traces = await _traceService.SearchTracesAsync(parameters);
                return Ok(traces);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching traces");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while searching traces");
            }
        }
    }
}
