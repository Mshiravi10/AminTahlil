using AminTahlil.Api.Models;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace AminTahlil.Api.Hubs
{
    /// <summary>
    /// SignalR client interface for notification methods
    /// </summary>
    public interface INotificationClient
    {
        /// <summary>
        /// Receive a new notification
        /// </summary>
        Task ReceiveNotification(Notification notification);
        
        /// <summary>
        /// Notification status has changed
        /// </summary>
        Task NotificationStatusChanged(string notificationId, bool isRead);
        
        /// <summary>
        /// All notifications have been marked as read
        /// </summary>
        Task AllNotificationsRead();
        
        /// <summary>
        /// A notification has been deleted
        /// </summary>
        Task NotificationDeleted(string notificationId);
    }
    
    /// <summary>
    /// SignalR hub for real-time notifications
    /// </summary>
    public class NotificationHub : Hub<INotificationClient>
    {
        private readonly ILogger<NotificationHub> _logger;
        
        /// <summary>
        /// Constructor
        /// </summary>
        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }
        
        /// <summary>
        /// When a client connects to the hub
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("Client connected to NotificationHub: {ConnectionId}", Context.ConnectionId);
            await base.OnConnectedAsync();
        }
        
        /// <summary>
        /// When a client disconnects from the hub
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            _logger.LogInformation("Client disconnected from NotificationHub: {ConnectionId}", Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
