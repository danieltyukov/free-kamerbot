/**
 * Send browser notifications
 * In a real implementation, this would use Web Push API
 */
function sendNotification(notification) {
  console.log(`🔔 Notification: ${notification.title} - ${notification.body}`);
  
  // Store notification for frontend to display
  // In production, you'd use Web Push API with service workers
  
  return {
    success: true,
    notification
  };
}

module.exports = {
  sendNotification
};
