using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace AminTahlil.Api.Models
{
    /// <summary>
    /// Represents a notification in the system
    /// </summary>
    public class Notification
    {
        /// <summary>
        /// Unique identifier for the notification
        /// </summary>
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        /// <summary>
        /// Type of notification
        /// </summary>
        public NotificationType Type { get; set; }
        
        /// <summary>
        /// The notification title
        /// </summary>
        public string Title { get; set; }
        
        /// <summary>
        /// Detailed message for the notification
        /// </summary>
        public string Message { get; set; }
        
        /// <summary>
        /// Creation timestamp of the notification
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// Whether the notification has been read
        /// </summary>
        public bool IsRead { get; set; } = false;
        
        /// <summary>
        /// Associated service name (if applicable)
        /// </summary>
        public string ServiceName { get; set; }
        
        /// <summary>
        /// Associated trace ID (if applicable)
        /// </summary>
        public string TraceId { get; set; }
        
        /// <summary>
        /// Additional data associated with the notification
        /// </summary>
        public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();
    }
    
    /// <summary>
    /// Types of notifications in the system
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum NotificationType
    {
        /// <summary>
        /// Information notification
        /// </summary>
        Info,
        
        /// <summary>
        /// Warning notification
        /// </summary>
        Warning,
        
        /// <summary>
        /// Error notification
        /// </summary>
        Error,
        
        /// <summary>
        /// System update notification
        /// </summary>
        SystemUpdate,
        
        /// <summary>
        /// Performance notification
        /// </summary>
        Performance
    }
    
    /// <summary>
    /// Request model for creating a notification
    /// </summary>
    public class CreateNotificationRequest
    {
        /// <summary>
        /// Type of notification
        /// </summary>
        public NotificationType Type { get; set; }
        
        /// <summary>
        /// The notification title
        /// </summary>
        public string Title { get; set; }
        
        /// <summary>
        /// Detailed message for the notification
        /// </summary>
        public string Message { get; set; }
        
        /// <summary>
        /// Associated service name (if applicable)
        /// </summary>
        public string ServiceName { get; set; }
        
        /// <summary>
        /// Associated trace ID (if applicable)
        /// </summary>
        public string TraceId { get; set; }
        
        /// <summary>
        /// Additional data associated with the notification
        /// </summary>
        public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();
    }
    
    /// <summary>
    /// Response model for notification operations
    /// </summary>
    public class NotificationResponse
    {
        /// <summary>
        /// List of notifications
        /// </summary>
        public List<Notification> Notifications { get; set; } = new List<Notification>();
        
        /// <summary>
        /// Total number of unread notifications
        /// </summary>
        public int UnreadCount { get; set; }
    }
}
