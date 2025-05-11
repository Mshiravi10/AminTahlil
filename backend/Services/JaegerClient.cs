using AminTahlil.Api.Configuration;
using AminTahlil.Api.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web;

namespace AminTahlil.Api.Services
{
    public class JaegerClient : IJaegerClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<JaegerClient> _logger;
        private readonly JaegerOptions _options;

        public JaegerClient(
            HttpClient httpClient,
            IOptions<JaegerOptions> options,
            ILogger<JaegerClient> logger)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
            
            _httpClient.BaseAddress = new Uri(_options.BaseUrl);
            _httpClient.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
        }

        public async Task<JaegerTraceResponse> SearchTracesAsync(TraceSearchParameters parameters)
        {
            try
            {
                var queryParams = new List<string>();
                
                if (!string.IsNullOrEmpty(parameters.Service))
                    queryParams.Add($"service={HttpUtility.UrlEncode(parameters.Service)}");
                
                if (!string.IsNullOrEmpty(parameters.Operation))
                    queryParams.Add($"operation={HttpUtility.UrlEncode(parameters.Operation)}");
                
                if (!string.IsNullOrEmpty(parameters.Tags))
                    queryParams.Add($"tags={HttpUtility.UrlEncode(parameters.Tags)}");
                
                if (parameters.MinDuration.HasValue)
                    queryParams.Add($"minDuration={parameters.MinDuration.Value}");
                
                if (parameters.MaxDuration.HasValue)
                    queryParams.Add($"maxDuration={parameters.MaxDuration.Value}");
                
                if (parameters.StartTimeMin.HasValue)
                {
                    var unixTimeMs = new DateTimeOffset(parameters.StartTimeMin.Value).ToUnixTimeMilliseconds();
                    queryParams.Add($"start={unixTimeMs}");
                }
                
                if (parameters.StartTimeMax.HasValue)
                {
                    var unixTimeMs = new DateTimeOffset(parameters.StartTimeMax.Value).ToUnixTimeMilliseconds();
                    queryParams.Add($"end={unixTimeMs}");
                }
                
                queryParams.Add($"limit={parameters.Limit}");

                var url = $"?{string.Join("&", queryParams)}";
                _logger.LogInformation($"Searching traces with URL: {url}");

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var result = await response.Content.ReadFromJsonAsync<JaegerTraceResponse>();
                return result ?? new JaegerTraceResponse { Data = new List<JaegerTrace>() };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching traces");
                throw;
            }
        }

        public async Task<JaegerTraceResponse> GetTraceAsync(string traceId)
        {
            try
            {
                _logger.LogInformation($"Getting trace with ID: {traceId}");
                var response = await _httpClient.GetAsync($"{traceId}");
                response.EnsureSuccessStatusCode();

                var result = await response.Content.ReadFromJsonAsync<JaegerTraceResponse>();
                return result ?? new JaegerTraceResponse { Data = new List<JaegerTrace>() };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting trace {traceId}");
                throw;
            }
        }

        public async Task<List<string>> GetServicesAsync()
        {
            try
            {
                _logger.LogInformation("Getting available services");
                var response = await _httpClient.GetAsync("services");
                response.EnsureSuccessStatusCode();

                var servicesData = await response.Content.ReadFromJsonAsync<JsonElement>();
                var services = new List<string>();
                
                if (servicesData.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in data.EnumerateArray())
                    {
                        services.Add(item.GetString() ?? string.Empty);
                    }
                }
                
                return services;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting services");
                throw;
            }
        }

        public async Task<List<string>> GetOperationsAsync(string service)
        {
            try
            {
                _logger.LogInformation($"Getting operations for service: {service}");
                var response = await _httpClient.GetAsync($"services/{HttpUtility.UrlEncode(service)}/operations");
                response.EnsureSuccessStatusCode();

                var operationsData = await response.Content.ReadFromJsonAsync<JsonElement>();
                var operations = new List<string>();
                
                if (operationsData.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in data.EnumerateArray())
                    {
                        operations.Add(item.GetString() ?? string.Empty);
                    }
                }
                
                return operations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting operations for service {service}");
                throw;
            }
        }
    }
}
