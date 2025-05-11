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
    public class DashboardController : ControllerBase
    {
        private readonly ITraceService _traceService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(ITraceService traceService, ILogger<DashboardController> logger)
        {
            _traceService = traceService ?? throw new ArgumentNullException(nameof(traceService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get dashboard summary statistics
        /// </summary>
        /// <returns>Dashboard summary statistics</returns>
        [HttpGet("summary")]
        [ProducesResponseType(typeof(DashboardSummary), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetSummary()
        {
            try
            {
                _logger.LogInformation("Getting dashboard summary statistics");
                
                // Get data from various sources
                var services = await _traceService.GetServicesAsync();
                var errorTraces = await _traceService.GetErrorTracesAsync(100);
                var recentTraces = await _traceService.SearchTracesAsync(new TraceSearchParameters 
                { 
                    StartTimeMin = DateTime.UtcNow.AddHours(-24),
                    Limit = 100
                });
                var slowSpans = await _traceService.GetSlowSpansAsync(100);
                
                // Calculate summary statistics
                var summary = new DashboardSummary
                {
                    ServiceCount = services.Count,
                    TracesLast24Hours = recentTraces.Count,
                    ErrorCount = errorTraces.Count,
                    ErrorPercentage = recentTraces.Count > 0 
                        ? Math.Round((double)errorTraces.Count / recentTraces.Count * 100, 2) 
                        : 0,
                    AverageTraceDuration = recentTraces.Count > 0 
                        ? recentTraces.Average(t => t.Duration.TotalMilliseconds) 
                        : 0,
                    TopServices = services
                        .Take(5)
                        .ToList(),
                    TopErrorTraces = errorTraces
                        .OrderByDescending(t => t.StartTime)
                        .Take(5)
                        .ToList(),
                    TopSlowSpans = slowSpans
                        .OrderByDescending(s => s.Duration)
                        .Take(5)
                        .ToList()
                };
                
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard summary");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving dashboard summary");
            }
        }
    }
}
