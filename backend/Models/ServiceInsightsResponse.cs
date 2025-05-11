using System;
using System.Collections.Generic;

namespace AminTahlil.Api.Models
{
    /// <summary>
    /// Detailed statistics and insights for a specific service
    /// </summary>
    public class ServiceInsightsResponse
    {
        /// <summary>
        /// Name of the service
        /// </summary>
        public string ServiceName { get; set; }
        
        /// <summary>
        /// Number of operations for this service
        /// </summary>
        public int OperationCount { get; set; }
        
        /// <summary>
        /// Number of traces involving this service in the analysis period
        /// </summary>
        public int TraceCount { get; set; }
        
        /// <summary>
        /// Number of error traces involving this service
        /// </summary>
        public int ErrorCount { get; set; }
        
        /// <summary>
        /// Percentage of traces with errors
        /// </summary>
        public double ErrorPercentage { get; set; }
        
        /// <summary>
        /// Average duration of spans for this service in milliseconds
        /// </summary>
        public double AverageSpanDuration { get; set; }
        
        /// <summary>
        /// Statistics for each operation of this service
        /// </summary>
        public List<OperationStatistics> OperationStats { get; set; } = new List<OperationStatistics>();
        
        /// <summary>
        /// Recent traces involving this service
        /// </summary>
        public List<Trace> RecentTraces { get; set; } = new List<Trace>();
    }

    /// <summary>
    /// Statistics for a specific operation
    /// </summary>
    public class OperationStatistics
    {
        /// <summary>
        /// Name of the operation
        /// </summary>
        public string OperationName { get; set; }
        
        /// <summary>
        /// Number of traces involving this operation
        /// </summary>
        public int Count { get; set; }
        
        /// <summary>
        /// Average duration of this operation in milliseconds
        /// </summary>
        public double AverageDuration { get; set; }
        
        /// <summary>
        /// Number of errors for this operation
        /// </summary>
        public int ErrorCount { get; set; }
        
        /// <summary>
        /// Maximum duration of this operation in milliseconds
        /// </summary>
        public double MaxDuration { get; set; }
    }
}
