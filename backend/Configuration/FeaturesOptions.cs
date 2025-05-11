namespace AminTahlil.Api.Configuration
{
    /// <summary>
    /// Configuration options for application features
    /// </summary>
    public class FeaturesOptions
    {
        /// <summary>
        /// Configuration section name
        /// </summary>
        public const string Features = "Features";
        
        /// <summary>
        /// Whether the service map feature is enabled
        /// </summary>
        public bool EnableServiceMap { get; set; } = true;
        
        /// <summary>
        /// Whether the trace comparison feature is enabled
        /// </summary>
        public bool EnableTraceComparison { get; set; } = true;
        
        /// <summary>
        /// Whether the trace export feature is enabled
        /// </summary>
        public bool EnableTraceExport { get; set; } = true;
        
        /// <summary>
        /// Whether the dashboard analytics feature is enabled
        /// </summary>
        public bool EnableDashboardAnalytics { get; set; } = true;
        
        /// <summary>
        /// Whether the notification system feature is enabled
        /// </summary>
        public bool EnableNotifications { get; set; } = true;
    }
}
