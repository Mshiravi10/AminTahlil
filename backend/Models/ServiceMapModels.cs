using System.Collections.Generic;

namespace AminTahlil.Api.Models
{
    /// <summary>
    /// Extended service map response with detailed visualization data
    /// </summary>
    public class ServiceMapVisualizationResponse
    {
        /// <summary>
        /// The service map data
        /// </summary>
        public ServiceMap ServiceMap { get; set; }
        
        /// <summary>
        /// Layout information for visualization
        /// </summary>
        public ServiceMapLayout Layout { get; set; }
        
        /// <summary>
        /// Aggregated statistics for the service map
        /// </summary>
        public ServiceMapStatistics Statistics { get; set; }
    }
    
    /// <summary>
    /// Layout information for the service map visualization
    /// </summary>
    public class ServiceMapLayout
    {
        /// <summary>
        /// Node positions for visualization
        /// </summary>
        public Dictionary<string, ServiceMapNodePosition> NodePositions { get; set; } = new Dictionary<string, ServiceMapNodePosition>();
        
        /// <summary>
        /// Dimensions for the visualized service map
        /// </summary>
        public ServiceMapDimensions Dimensions { get; set; } = new ServiceMapDimensions();
    }
    
    /// <summary>
    /// Node position in the service map visualization
    /// </summary>
    public class ServiceMapNodePosition
    {
        /// <summary>
        /// X coordinate
        /// </summary>
        public double X { get; set; }
        
        /// <summary>
        /// Y coordinate
        /// </summary>
        public double Y { get; set; }
    }
    
    /// <summary>
    /// Dimensions for the service map visualization
    /// </summary>
    public class ServiceMapDimensions
    {
        /// <summary>
        /// Width of the service map visualization
        /// </summary>
        public int Width { get; set; } = 1000;
        
        /// <summary>
        /// Height of the service map visualization
        /// </summary>
        public int Height { get; set; } = 800;
    }
    
    /// <summary>
    /// Aggregated statistics for the service map
    /// </summary>
    public class ServiceMapStatistics
    {
        /// <summary>
        /// Total number of services
        /// </summary>
        public int ServiceCount { get; set; }
        
        /// <summary>
        /// Total number of connections between services
        /// </summary>
        public int ConnectionCount { get; set; }
        
        /// <summary>
        /// Total number of operations across all services
        /// </summary>
        public int OperationCount { get; set; }
        
        /// <summary>
        /// Total number of traces analyzed
        /// </summary>
        public int TraceCount { get; set; }
        
        /// <summary>
        /// Services with the most connections
        /// </summary>
        public List<ServiceConnectionCount> MostConnectedServices { get; set; } = new List<ServiceConnectionCount>();
        
        /// <summary>
        /// Services with the highest error rates
        /// </summary>
        public List<ServiceErrorRate> HighestErrorRateServices { get; set; } = new List<ServiceErrorRate>();
    }
    
    /// <summary>
    /// Service connection count
    /// </summary>
    public class ServiceConnectionCount
    {
        /// <summary>
        /// Service name
        /// </summary>
        public string ServiceName { get; set; }
        
        /// <summary>
        /// Number of connections
        /// </summary>
        public int ConnectionCount { get; set; }
    }
    
    /// <summary>
    /// Service error rate
    /// </summary>
    public class ServiceErrorRate
    {
        /// <summary>
        /// Service name
        /// </summary>
        public string ServiceName { get; set; }
        
        /// <summary>
        /// Error rate percentage
        /// </summary>
        public double ErrorRate { get; set; }
    }
}
