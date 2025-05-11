using AminTahlil.Api.Configuration;
using AminTahlil.Api.Hubs;
using AminTahlil.Api.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AminTahlil.Api.Services
{
    /// <summary>
    /// Service for managing system notifications
    /// </summary>
    public interface INotificationService
    {
        /// <summary>
        /// Create a new notification and broadcast it via SignalR
        /// </summary>
        Task<Notification> CreateNotificationAsync(CreateNotificationRequest request);
        
        /// <summary>
        /// Get all notifications
        /// </summary>
        Task<List<Notification>> GetAllNotificationsAsync();
        
        /// <summary>
        /// Get unread notifications
        /// </summary>
        Task<List<Notification>> GetUnreadNotificationsAsync();
        
        /// <summary>
        /// Mark a notification as read
        /// </summary>
        Task<bool> MarkNotificationAsReadAsync(string notificationId);
        
        /// <summary>
        /// Mark all notifications as read
        /// </summary>
        Task<int> MarkAllNotificationsAsReadAsync();
        
        /// <summary>
        /// Delete a notification
        /// </summary>
        Task<bool> DeleteNotificationAsync(string notificationId);
        
        /// <summary>
        /// Create system error notification for service errors
        /// </summary>
        Task CreateServiceErrorNotificationAsync(string serviceName, string errorMessage, string traceId = null);
        
        /// <summary>
        /// Create system update notification
        /// </summary>
        Task CreateSystemUpdateNotificationAsync(string message);
        
        /// <summary>
        /// Create performance warning notification
        /// </summary>
        Task CreatePerformanceWarningAsync(string serviceName, string message, string traceId = null);
    }
    
    /// <summary>
    /// Implementation of notification service
    /// </summary>
    public class NotificationService : INotificationService
    {
        private readonly IRedisService _redisService;
        private readonly IHubContext<NotificationHub, INotificationClient> _notificationHub;
        private readonly RedisOptions _redisOptions;
        private readonly ILogger<NotificationService> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public NotificationService(
            IRedisService redisService,
            IHubContext<NotificationHub, INotificationClient> notificationHub,
            IOptions<RedisOptions> redisOptions,
            ILogger<NotificationService> logger)
        {
            _redisService = redisService;
            _notificationHub = notificationHub;
            _redisOptions = redisOptions.Value;
            _logger = logger;
        }
        
        /// <inheritdoc />
        public async Task<Notification> CreateNotificationAsync(CreateNotificationRequest request)
        {
            var notification = new Notification
            {
                Type = request.Type,
                Title = request.Title,
                Message = request.Message,
                ServiceName = request.ServiceName,
                TraceId = request.TraceId,
                Metadata = request.Metadata ?? new Dictionary<string, string>()
            };
            
            // Add to Redis
            await StoreNotificationAsync(notification);
            
            // Broadcast via SignalR
            await _notificationHub.Clients.All.ReceiveNotification(notification);
            
            _logger.LogInformation("Created notification: {Title}", notification.Title);
            
            return notification;
        }
        
        /// <inheritdoc />
        public async Task<List<Notification>> GetAllNotificationsAsync()
        {
            var notifications = await GetNotificationsFromRedisAsync();
            return notifications.OrderByDescending(n => n.Timestamp).ToList();
        }
        
        /// <inheritdoc />
        public async Task<List<Notification>> GetUnreadNotificationsAsync()
        {
            var notifications = await GetNotificationsFromRedisAsync();
            return notifications.Where(n => !n.IsRead).OrderByDescending(n => n.Timestamp).ToList();
        }
        
        /// <inheritdoc />
        public async Task<bool> MarkNotificationAsReadAsync(string notificationId)
        {
            var notifications = await GetNotificationsFromRedisAsync();
            var notification = notifications.FirstOrDefault(n => n.Id == notificationId);
            
            if (notification == null)
            {
                return false;
            }
            
            notification.IsRead = true;
            await SaveNotificationsToRedisAsync(notifications);
            
            // Broadcast update via SignalR
            await _notificationHub.Clients.All.NotificationStatusChanged(notificationId, true);
            
            return true;
        }
        
        /// <inheritdoc />
        public async Task<int> MarkAllNotificationsAsReadAsync()
        {
            var notifications = await GetNotificationsFromRedisAsync();
            int count = 0;
            
            foreach (var notification in notifications.Where(n => !n.IsRead))
            {
                notification.IsRead = true;
                count++;
            }
            
            if (count > 0)
            {
                await SaveNotificationsToRedisAsync(notifications);
                await _notificationHub.Clients.All.AllNotificationsRead();
            }
            
            return count;
        }
        
        /// <inheritdoc />
        public async Task<bool> DeleteNotificationAsync(string notificationId)
        {
            var notifications = await GetNotificationsFromRedisAsync();
            var notification = notifications.FirstOrDefault(n => n.Id == notificationId);
            
            if (notification == null)
            {
                return false;
            }
            
            notifications.Remove(notification);
            await SaveNotificationsToRedisAsync(notifications);
            
            // Broadcast deletion via SignalR
            await _notificationHub.Clients.All.NotificationDeleted(notificationId);
            
            return true;
        }
        
        /// <inheritdoc />
        public async Task CreateServiceErrorNotificationAsync(string serviceName, string errorMessage, string traceId = null)
        {
            await CreateNotificationAsync(new CreateNotificationRequest
            {
                Type = NotificationType.Error,
                Title = $"خطای سرویس {serviceName}",
                Message = errorMessage,
                ServiceName = serviceName,
                TraceId = traceId,
                Metadata = new Dictionary<string, string>
                {
                    { "errorType", "serviceError" },
                    { "timestamp", DateTime.UtcNow.ToString("o") }
                }
            });
        }
        
        /// <inheritdoc />
        public async Task CreateSystemUpdateNotificationAsync(string message)
        {
            await CreateNotificationAsync(new CreateNotificationRequest
            {
                Type = NotificationType.SystemUpdate,
                Title = "بروزرسانی سیستم",
                Message = message,
                Metadata = new Dictionary<string, string>
                {
                    { "updateType", "system" },
                    { "timestamp", DateTime.UtcNow.ToString("o") }
                }
            });
        }
        
        /// <inheritdoc />
        public async Task CreatePerformanceWarningAsync(string serviceName, string message, string traceId = null)
        {
            await CreateNotificationAsync(new CreateNotificationRequest
            {
                Type = NotificationType.Performance,
                Title = $"کندی سرویس {serviceName}",
                Message = message,
                ServiceName = serviceName,
                TraceId = traceId,
                Metadata = new Dictionary<string, string>
                {
                    { "warningType", "performance" },
                    { "timestamp", DateTime.UtcNow.ToString("o") }
                }
            });
        }
        
        #region Private helper methods
        
        private async Task StoreNotificationAsync(Notification notification)
        {
            var notifications = await GetNotificationsFromRedisAsync();
            
            // Add the new notification
            notifications.Add(notification);
            
            // Limit to 100 notifications
            if (notifications.Count > 100)
            {
                notifications = notifications.OrderByDescending(n => n.Timestamp).Take(100).ToList();
            }
            
            await SaveNotificationsToRedisAsync(notifications);
        }
        
        private async Task<List<Notification>> GetNotificationsFromRedisAsync()
        {
            var notifications = await _redisService.GetAsync<List<Notification>>(_redisOptions.NotificationCacheKey);
            return notifications ?? new List<Notification>();
        }
        
        private async Task SaveNotificationsToRedisAsync(List<Notification> notifications)
        {
            await _redisService.SetAsync(_redisOptions.NotificationCacheKey, notifications);
        }
        
        #endregion
    }
}
