using Microsoft.Extensions.Options;
using StackExchange.Redis;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using AminTahlil.Api.Configuration;

namespace AminTahlil.Api.Services
{
    /// <summary>
    /// Service for interacting with Redis cache
    /// </summary>
    public interface IRedisService
    {
        /// <summary>
        /// Get a value from Redis
        /// </summary>
        Task<T> GetAsync<T>(string key);
        
        /// <summary>
        /// Set a value in Redis
        /// </summary>
        Task SetAsync<T>(string key, T value, TimeSpan? expiry = null);
        
        /// <summary>
        /// Remove a value from Redis
        /// </summary>
        Task RemoveAsync(string key);
        
        /// <summary>
        /// Check if a key exists in Redis
        /// </summary>
        Task<bool> ExistsAsync(string key);
        
        /// <summary>
        /// Add item to a list
        /// </summary>
        Task<long> ListAddAsync<T>(string key, T value);
        
        /// <summary>
        /// Get all items from a list
        /// </summary>
        Task<T[]> ListGetAllAsync<T>(string key);
        
        /// <summary>
        /// Remove item from a list
        /// </summary>
        Task<long> ListRemoveAsync<T>(string key, T value);
    }
    
    /// <summary>
    /// Implementation of Redis service
    /// </summary>
    public class RedisService : IRedisService
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly IDatabase _db;
        private readonly JsonSerializerOptions _jsonOptions;
        private readonly ILogger<RedisService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public RedisService(IOptions<RedisOptions> redisOptions, ILogger<RedisService> logger)
        {
            _logger = logger;
            try
            {
                var options = redisOptions.Value;
                _redis = ConnectionMultiplexer.Connect(options.ConnectionString);
                _db = _redis.GetDatabase();
                
                _jsonOptions = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };
                
                _logger.LogInformation("Redis connection established");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to connect to Redis");
                throw;
            }
        }
        
        /// <inheritdoc />
        public async Task<T> GetAsync<T>(string key)
        {
            try
            {
                var value = await _db.StringGetAsync(key);
                if (value.IsNullOrEmpty)
                {
                    return default;
                }
                
                return JsonSerializer.Deserialize<T>(value, _jsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting value from Redis for key {Key}", key);
                return default;
            }
        }
        
        /// <inheritdoc />
        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            try
            {
                var serialized = JsonSerializer.Serialize(value, _jsonOptions);
                await _db.StringSetAsync(key, serialized, expiry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting value in Redis for key {Key}", key);
            }
        }
        
        /// <inheritdoc />
        public async Task RemoveAsync(string key)
        {
            try
            {
                await _db.KeyDeleteAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing key {Key} from Redis", key);
            }
        }
        
        /// <inheritdoc />
        public async Task<bool> ExistsAsync(string key)
        {
            try
            {
                return await _db.KeyExistsAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if key {Key} exists in Redis", key);
                return false;
            }
        }
        
        /// <inheritdoc />
        public async Task<long> ListAddAsync<T>(string key, T value)
        {
            try
            {
                var serialized = JsonSerializer.Serialize(value, _jsonOptions);
                return await _db.ListRightPushAsync(key, serialized);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding to list {Key} in Redis", key);
                return 0;
            }
        }
        
        /// <inheritdoc />
        public async Task<T[]> ListGetAllAsync<T>(string key)
        {
            try
            {
                var values = await _db.ListRangeAsync(key);
                if (values.Length == 0)
                {
                    return Array.Empty<T>();
                }
                
                var result = new T[values.Length];
                for (int i = 0; i < values.Length; i++)
                {
                    result[i] = JsonSerializer.Deserialize<T>(values[i], _jsonOptions);
                }
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting list {Key} from Redis", key);
                return Array.Empty<T>();
            }
        }
        
        /// <inheritdoc />
        public async Task<long> ListRemoveAsync<T>(string key, T value)
        {
            try
            {
                var serialized = JsonSerializer.Serialize(value, _jsonOptions);
                return await _db.ListRemoveAsync(key, serialized);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing from list {Key} in Redis", key);
                return 0;
            }
        }
    }
}
