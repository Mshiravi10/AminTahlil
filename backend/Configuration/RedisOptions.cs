namespace AminTahlil.Api.Configuration
{
    /// <summary>
    /// Configuration options for Redis
    /// </summary>
    public class RedisOptions
    {
        /// <summary>
        /// Configuration section name
        /// </summary>
        public const string Redis = "Redis";
        
        /// <summary>
        /// Connection string for Redis
        /// </summary>
        public string ConnectionString { get; set; } = "localhost:6379";
        
        /// <summary>
        /// Default expiration time for cached items in seconds
        /// </summary>
        public int DefaultExpirationSeconds { get; set; } = 3600;
        
        /// <summary>
        /// Notification cache key
        /// </summary>
        public string NotificationCacheKey { get; set; } = "notifications";
    }
}
