using AminTahlil.Api.Models;
using AminTahlil.Api.Services;
using AminTahlil.Api.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AminTahlil.Api.Controllers
{
    [ApiController]
    [Route("api/service-map")]
    public class ServiceMapController : ControllerBase
    {
        private readonly ITraceService _traceService;
        private readonly ILogger<ServiceMapController> _logger;
        private readonly FeaturesOptions _featuresOptions;

        public ServiceMapController(
            ITraceService traceService, 
            ILogger<ServiceMapController> logger,
            IOptions<FeaturesOptions> featuresOptions)
        {
            _traceService = traceService ?? throw new ArgumentNullException(nameof(traceService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _featuresOptions = featuresOptions?.Value ?? throw new ArgumentNullException(nameof(featuresOptions));
        }

        /// <summary>
        /// Get the service map with visualization data
        /// </summary>
        /// <param name="timeRangeHours">Time range in hours to analyze (default: 24 hours)</param>
        /// <returns>Service map with visualization data</returns>
        [HttpGet("visualization")]
        [ProducesResponseType(typeof(ServiceMapVisualizationResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetServiceMapVisualization([FromQuery] int timeRangeHours = 24)
        {
            try
            {
                if (!_featuresOptions.EnableServiceMap)
                {
                    return BadRequest("Service map feature is disabled in configuration");
                }

                _logger.LogInformation($"Getting service map visualization for the last {timeRangeHours} hours");
                
                // Get the service map
                var serviceMap = await _traceService.GetServiceMapAsync();
                
                // Generate layout positions for the service map
                var layout = GenerateServiceMapLayout(serviceMap);
                
                // Calculate statistics
                var statistics = CalculateServiceMapStatistics(serviceMap);
                
                // Build the response
                var response = new ServiceMapVisualizationResponse
                {
                    ServiceMap = serviceMap,
                    Layout = layout,
                    Statistics = statistics
                };
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting service map visualization");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving service map visualization");
            }
        }

        /// <summary>
        /// Get service map filtered by specific services
        /// </summary>
        /// <param name="services">List of services to include</param>
        /// <returns>Filtered service map</returns>
        [HttpPost("filter")]
        [ProducesResponseType(typeof(ServiceMap), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetFilteredServiceMap([FromBody] List<string> services)
        {
            try
            {
                if (!_featuresOptions.EnableServiceMap)
                {
                    return BadRequest("Service map feature is disabled in configuration");
                }

                if (services == null || services.Count == 0)
                {
                    return BadRequest("At least one service must be specified");
                }

                _logger.LogInformation($"Getting filtered service map for {services.Count} services");
                
                // Get the full service map
                var fullServiceMap = await _traceService.GetServiceMapAsync();
                
                // Filter nodes by the specified services
                var filteredNodes = fullServiceMap.Nodes
                    .Where(n => services.Contains(n.Id))
                    .ToList();
                
                // Filter edges to only include connections between the filtered nodes
                var filteredEdges = fullServiceMap.Edges
                    .Where(e => services.Contains(e.Source) && services.Contains(e.Target))
                    .ToList();
                
                // Build the filtered service map
                var filteredServiceMap = new ServiceMap
                {
                    Nodes = filteredNodes,
                    Edges = filteredEdges
                };
                
                return Ok(filteredServiceMap);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting filtered service map");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving filtered service map");
            }
        }

        private ServiceMapLayout GenerateServiceMapLayout(ServiceMap serviceMap)
        {
            var layout = new ServiceMapLayout();
            var random = new Random(42); // Use a fixed seed for consistent layouts
            
            var nodeCount = serviceMap.Nodes.Count;
            
            // Simple circular layout for nodes
            for (int i = 0; i < nodeCount; i++)
            {
                var node = serviceMap.Nodes[i];
                
                // Calculate position in a circle
                var angle = 2 * Math.PI * i / nodeCount;
                var radius = 350;
                
                var x = 500 + radius * Math.Cos(angle);
                var y = 400 + radius * Math.Sin(angle);
                
                // Add some random offset
                x += random.NextDouble() * 50 - 25;
                y += random.NextDouble() * 50 - 25;
                
                layout.NodePositions[node.Id] = new ServiceMapNodePosition
                {
                    X = x,
                    Y = y
                };
            }
            
            return layout;
        }

        private ServiceMapStatistics CalculateServiceMapStatistics(ServiceMap serviceMap)
        {
            var statistics = new ServiceMapStatistics
            {
                ServiceCount = serviceMap.Nodes.Count,
                ConnectionCount = serviceMap.Edges.Count,
                OperationCount = serviceMap.Edges.Sum(e => e.Operations.Count),
                TraceCount = 0 // We don't have this information from the service map
            };
            
            // Calculate most connected services
            var serviceConnections = new Dictionary<string, int>();
            
            foreach (var edge in serviceMap.Edges)
            {
                if (!serviceConnections.ContainsKey(edge.Source))
                {
                    serviceConnections[edge.Source] = 0;
                }
                
                if (!serviceConnections.ContainsKey(edge.Target))
                {
                    serviceConnections[edge.Target] = 0;
                }
                
                serviceConnections[edge.Source]++;
                serviceConnections[edge.Target]++;
            }
            
            statistics.MostConnectedServices = serviceConnections
                .Select(kvp => new ServiceConnectionCount
                {
                    ServiceName = kvp.Key,
                    ConnectionCount = kvp.Value
                })
                .OrderByDescending(s => s.ConnectionCount)
                .Take(5)
                .ToList();
            
            // Calculate highest error rate services
            statistics.HighestErrorRateServices = serviceMap.Nodes
                .Where(n => n.CallCount > 0)
                .Select(n => new ServiceErrorRate
                {
                    ServiceName = n.ServiceName,
                    ErrorRate = n.CallCount > 0 ? (double)n.ErrorCount / n.CallCount * 100 : 0
                })
                .OrderByDescending(s => s.ErrorRate)
                .Take(5)
                .ToList();
            
            return statistics;
        }
    }
}
