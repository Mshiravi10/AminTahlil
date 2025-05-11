using AminTahlil.Api.Configuration;
using AminTahlil.Api.Models;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace AminTahlil.Api.Services
{
    /// <summary>
    /// Background service for monitoring services and generating notifications
    /// </summary>
    public class ServiceMonitoringService : BackgroundService
    {
        private readonly INotificationService _notificationService;
        private readonly ITraceService _traceService;
        private readonly FeaturesOptions _featuresOptions;
        private readonly ILogger<ServiceMonitoringService> _logger;
        private readonly Dictionary<string, DateTime> _lastServiceCheck = new Dictionary<string, DateTime>();
        private readonly Dictionary<string, int> _serviceErrorCount = new Dictionary<string, int>();
        private bool _systemUpdateNotified = false;

        /// <summary>
        /// Constructor
        /// </summary>
        public ServiceMonitoringService(
            INotificationService notificationService,
            ITraceService traceService,
            IOptions<FeaturesOptions> featuresOptions,
            ILogger<ServiceMonitoringService> logger)
        {
            _notificationService = notificationService;
            _traceService = traceService;
            _featuresOptions = featuresOptions.Value;
            _logger = logger;
        }

        /// <inheritdoc />
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_featuresOptions.EnableNotifications)
            {
                _logger.LogInformation("Notification feature is disabled. ServiceMonitoringService will not run.");
                return;
            }

            _logger.LogInformation("ServiceMonitoringService is starting.");

            // Initial delay before starting monitoring
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

            // Create initial system update notification
            if (!_systemUpdateNotified)
            {
                await _notificationService.CreateSystemUpdateNotificationAsync("نسخه جدید سیستم مانیتورینگ با موفقیت نصب شد.");
                _systemUpdateNotified = true;
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await MonitorPaymentServiceAsync();
                    await MonitorAuthServiceAsync();

                    // Wait 60 seconds between health checks
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    _logger.LogError(ex, "Error occurred while monitoring services");
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                }
            }

            _logger.LogInformation("ServiceMonitoringService is stopping.");
        }

        private async Task MonitorPaymentServiceAsync()
        {
            try
            {
                // Simulating checking payment service (in a real app, this would call a health check endpoint)
                bool isHealth = await SimulateServiceHealthCheck("سرویس پرداخت");
                
                if (!isHealth)
                {
                    if (!_serviceErrorCount.ContainsKey("سرویس پرداخت"))
                    {
                        _serviceErrorCount["سرویس پرداخت"] = 0;
                    }
                    
                    _serviceErrorCount["سرویس پرداخت"]++;
                    
                    if (_serviceErrorCount["سرویس پرداخت"] >= 3)
                    {
                        string traceId = $"trace-{Guid.NewGuid():N}".Substring(0, 16);
                        await _notificationService.CreateServiceErrorNotificationAsync(
                            "سرویس پرداخت",
                            "سرویس پرداخت با خطای ۵۰۰ مواجه شده است. لطفاً بررسی کنید.",
                            traceId);
                            
                        _serviceErrorCount["سرویس پرداخت"] = 0;
                    }
                }
                else
                {
                    _serviceErrorCount["سرویس پرداخت"] = 0;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error monitoring payment service");
            }
        }

        private async Task MonitorAuthServiceAsync()
        {
            try
            {
                // Simulating checking authentication service response times
                int responseTimeMs = await SimulateServiceResponseTime("سرویس احراز هویت");
                
                // If response time is greater than 500ms, generate a performance warning
                if (responseTimeMs > 500)
                {
                    if (!_lastServiceCheck.ContainsKey("سرویس احراز هویت") ||
                        DateTime.UtcNow - _lastServiceCheck["سرویس احراز هویت"] > TimeSpan.FromHours(1))
                    {
                        string traceId = $"trace-{Guid.NewGuid():N}".Substring(0, 16);
                        await _notificationService.CreatePerformanceWarningAsync(
                            "سرویس احراز هویت",
                            "زمان پاسخگویی سرویس احراز هویت افزایش یافته است.",
                            traceId);
                            
                        _lastServiceCheck["سرویس احراز هویت"] = DateTime.UtcNow;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error monitoring authentication service");
            }
        }

        // Simulate service health check (for demo purposes)
        private Task<bool> SimulateServiceHealthCheck(string serviceName)
        {
            // For demo purposes, sometimes return false to simulate errors
            // In a real application, this would make actual HTTP calls to service health endpoints
            Random random = new Random();
            return Task.FromResult(random.Next(0, 10) > 2); // 30% chance of service being unhealthy
        }

        // Simulate service response time check (for demo purposes)
        private Task<int> SimulateServiceResponseTime(string serviceName)
        {
            // For demo purposes, sometimes return high response times
            // In a real application, this would measure actual response times from traces
            Random random = new Random();
            int baseTime = 200;
            int variability = random.Next(0, 500);
            return Task.FromResult(baseTime + variability);
        }
    }
}
