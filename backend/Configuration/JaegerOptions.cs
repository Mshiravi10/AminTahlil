namespace AminTahlil.Api.Configuration
{
    public class JaegerOptions
    {
        public const string Jaeger = "Jaeger";
        
        public string BaseUrl { get; set; } = string.Empty;
        public int TimeoutSeconds { get; set; } = 15;
    }

    public class FeaturesOptions
    {
        public const string Features = "Features";
        
        public bool EnableServiceMap { get; set; } = true;
        public bool EnableExport { get; set; } = true;
    }
}
