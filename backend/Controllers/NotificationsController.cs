using AminTahlil.Api.Models;
using AminTahlil.Api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AminTahlil.Api.Controllers
{
    /// <summary>
    /// Controller for managing system notifications
    /// </summary>
    [ApiController]
    [Route("api/notifications")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationsController> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public NotificationsController(INotificationService notificationService, ILogger<NotificationsController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }
        
        /// <summary>
        /// Get all notifications
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(NotificationResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllNotifications()
        {
            _logger.LogInformation("Getting all notifications");
            
            var notifications = await _notificationService.GetAllNotificationsAsync();
            var unreadCount = notifications.Count(n => !n.IsRead);
            
            return Ok(new NotificationResponse
            {
                Notifications = notifications,
                UnreadCount = unreadCount
            });
        }
        
        /// <summary>
        /// Get unread notifications
        /// </summary>
        [HttpGet("unread")]
        [ProducesResponseType(typeof(NotificationResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUnreadNotifications()
        {
            _logger.LogInformation("Getting unread notifications");
            
            var notifications = await _notificationService.GetUnreadNotificationsAsync();
            
            return Ok(new NotificationResponse
            {
                Notifications = notifications,
                UnreadCount = notifications.Count
            });
        }
        
        /// <summary>
        /// Create a new notification
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(Notification), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationRequest request)
        {
            if (string.IsNullOrEmpty(request.Title) || string.IsNullOrEmpty(request.Message))
            {
                return BadRequest("Title and Message are required");
            }
            
            _logger.LogInformation("Creating notification: {Title}", request.Title);
            
            var notification = await _notificationService.CreateNotificationAsync(request);
            
            return CreatedAtAction(nameof(GetAllNotifications), new { id = notification.Id }, notification);
        }
        
        /// <summary>
        /// Mark a notification as read
        /// </summary>
        [HttpPut("{id}/read")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> MarkAsRead(string id)
        {
            _logger.LogInformation("Marking notification {Id} as read", id);
            
            var result = await _notificationService.MarkNotificationAsReadAsync(id);
            
            if (!result)
            {
                return NotFound();
            }
            
            return Ok();
        }
        
        /// <summary>
        /// Mark all notifications as read
        /// </summary>
        [HttpPut("read-all")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> MarkAllAsRead()
        {
            _logger.LogInformation("Marking all notifications as read");
            
            var count = await _notificationService.MarkAllNotificationsAsReadAsync();
            
            return Ok(new { Count = count });
        }
        
        /// <summary>
        /// Delete a notification
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteNotification(string id)
        {
            _logger.LogInformation("Deleting notification {Id}", id);
            
            var result = await _notificationService.DeleteNotificationAsync(id);
            
            if (!result)
            {
                return NotFound();
            }
            
            return NoContent();
        }
        
        /// <summary>
        /// Test endpoint for creating different types of notifications
        /// </summary>
        [HttpPost("test/{type}")]
        [ProducesResponseType(typeof(Notification), StatusCodes.Status201Created)]
        public async Task<IActionResult> CreateTestNotification(string type)
        {
            Notification notification = null;
            
            switch (type.ToLower())
            {
                case "error":
                    await _notificationService.CreateServiceErrorNotificationAsync(
                        "سرویس پرداخت", 
                        "سرویس پرداخت با خطای ۵۰۰ مواجه شده است. لطفاً بررسی کنید.", 
                        "trace-" + Guid.NewGuid().ToString("N").Substring(0, 8));
                    break;
                    
                case "update":
                    await _notificationService.CreateSystemUpdateNotificationAsync(
                        "نسخه جدید سیستم مانیتورینگ با موفقیت نصب شد.");
                    break;
                    
                case "performance":
                    await _notificationService.CreatePerformanceWarningAsync(
                        "سرویس احراز هویت", 
                        "زمان پاسخگویی سرویس احراز هویت افزایش یافته است.", 
                        "trace-" + Guid.NewGuid().ToString("N").Substring(0, 8));
                    break;
                    
                default:
                    var notificationRequest = new CreateNotificationRequest
                    {
                        Type = NotificationType.Info,
                        Title = "اعلان تست",
                        Message = "این یک اعلان تست است."
                    };
                    notification = await _notificationService.CreateNotificationAsync(notificationRequest);
                    break;
            }
            
            return Ok(notification);
        }
    }
}
