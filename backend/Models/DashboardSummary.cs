using System;
using System.Collections.Generic;

namespace AminTahlil.Api.Models
{
    /// <summary>
    /// Summary statistics for the dashboard
    /// </summary>
    public class DashboardSummary
    {
        /// <summary>
        /// Number of services in the system
        /// </summary>
        public int ServiceCount { get; set; }
        
        /// <summary>
        /// Number of traces recorded in the last 24 hours
        /// </summary>
        public int TracesLast24Hours { get; set; }
        
        /// <summary>
        /// Number of error traces in the last 24 hours
        /// </summary>
        public int ErrorCount { get; set; }
        
        /// <summary>
        /// Percentage of traces with errors
        /// </summary>
        public double ErrorPercentage { get; set; }
        
        /// <summary>
        /// Average duration of traces in milliseconds
        /// </summary>
        public double AverageTraceDuration { get; set; }
        
        /// <summary>
        /// List of the top services by trace count
        /// </summary>
        public List<string> TopServices { get; set; } = new List<string>();
        
        /// <summary>
        /// List of the most recent error traces
        /// </summary>
        public List<Trace> TopErrorTraces { get; set; } = new List<Trace>();
        
        /// <summary>
        /// List of the slowest spans
        /// </summary>
        public List<Span> TopSlowSpans { get; set; } = new List<Span>();
    }
}
