using System;
using System.Collections.Generic;

namespace AminTahlil.Api.Models
{
    /// <summary>
    /// Request model for trace comparison
    /// </summary>
    public class TraceComparisonRequest
    {
        /// <summary>
        /// List of trace IDs to compare
        /// </summary>
        public List<string> TraceIds { get; set; } = new List<string>();
    }

    /// <summary>
    /// Result of trace comparison
    /// </summary>
    public class TraceComparisonResult
    {
        /// <summary>
        /// List of traces being compared
        /// </summary>
        public List<Trace> Traces { get; set; } = new List<Trace>();
        
        /// <summary>
        /// List of services that appear in all traces
        /// </summary>
        public List<string> CommonServices { get; set; } = new List<string>();
        
        /// <summary>
        /// List of operations that appear in all traces
        /// </summary>
        public List<string> CommonOperations { get; set; } = new List<string>();
        
        /// <summary>
        /// Comparison of services across traces
        /// </summary>
        public List<ServiceComparisonItem> ServiceComparison { get; set; } = new List<ServiceComparisonItem>();
        
        /// <summary>
        /// Comparison of operations across traces
        /// </summary>
        public List<OperationComparisonItem> OperationComparison { get; set; } = new List<OperationComparisonItem>();
        
        /// <summary>
        /// Overall duration comparison
        /// </summary>
        public TraceDurationComparison DurationComparison { get; set; }
    }

    /// <summary>
    /// Service comparison item
    /// </summary>
    public class ServiceComparisonItem
    {
        /// <summary>
        /// Service name
        /// </summary>
        public string ServiceName { get; set; }
        
        /// <summary>
        /// Duration of this service in each trace
        /// </summary>
        public List<ServiceTraceDuration> TraceDurations { get; set; } = new List<ServiceTraceDuration>();
    }

    /// <summary>
    /// Service duration in a trace
    /// </summary>
    public class ServiceTraceDuration
    {
        /// <summary>
        /// Trace ID
        /// </summary>
        public string TraceId { get; set; }
        
        /// <summary>
        /// Total duration of spans for this service in milliseconds
        /// </summary>
        public double TotalDuration { get; set; }
        
        /// <summary>
        /// Number of spans for this service
        /// </summary>
        public int SpanCount { get; set; }
        
        /// <summary>
        /// Whether this service had any errors in this trace
        /// </summary>
        public bool HasError { get; set; }
    }

    /// <summary>
    /// Operation comparison item
    /// </summary>
    public class OperationComparisonItem
    {
        /// <summary>
        /// Service name
        /// </summary>
        public string ServiceName { get; set; }
        
        /// <summary>
        /// Operation name
        /// </summary>
        public string OperationName { get; set; }
        
        /// <summary>
        /// Duration of this operation in each trace
        /// </summary>
        public List<OperationTraceDuration> TraceDurations { get; set; } = new List<OperationTraceDuration>();
    }

    /// <summary>
    /// Operation duration in a trace
    /// </summary>
    public class OperationTraceDuration
    {
        /// <summary>
        /// Trace ID
        /// </summary>
        public string TraceId { get; set; }
        
        /// <summary>
        /// Average duration of spans for this operation in milliseconds
        /// </summary>
        public double AverageDuration { get; set; }
        
        /// <summary>
        /// Maximum duration of spans for this operation in milliseconds
        /// </summary>
        public double MaxDuration { get; set; }
        
        /// <summary>
        /// Number of spans for this operation
        /// </summary>
        public int SpanCount { get; set; }
        
        /// <summary>
        /// Whether this operation had any errors in this trace
        /// </summary>
        public bool HasError { get; set; }
    }

    /// <summary>
    /// Overall duration comparison
    /// </summary>
    public class TraceDurationComparison
    {
        /// <summary>
        /// Duration information for each trace
        /// </summary>
        public List<TraceDurationItem> TraceDurations { get; set; } = new List<TraceDurationItem>();
    }

    /// <summary>
    /// Duration information for a trace
    /// </summary>
    public class TraceDurationItem
    {
        /// <summary>
        /// Trace ID
        /// </summary>
        public string TraceId { get; set; }
        
        /// <summary>
        /// Start time of the trace
        /// </summary>
        public DateTime StartTime { get; set; }
        
        /// <summary>
        /// End time of the trace
        /// </summary>
        public DateTime EndTime { get; set; }
        
        /// <summary>
        /// Total duration of the trace in milliseconds
        /// </summary>
        public double Duration { get; set; }
        
        /// <summary>
        /// Number of spans in the trace
        /// </summary>
        public int SpanCount { get; set; }
        
        /// <summary>
        /// Number of services involved in the trace
        /// </summary>
        public int ServiceCount { get; set; }
        
        /// <summary>
        /// Whether the trace had any errors
        /// </summary>
        public bool HasError { get; set; }
    }
}
