import { UIRenderer } from './ui-renderer.js';
import { Storage } from './storage.js';

export class NotificationManager {
  constructor(favorManager, toastContainer) {
    this.favorManager = favorManager;
    this.toastContainer = toastContainer;
    this.requestPermission();
    this.startReminderCheck();
  }

  requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  startReminderCheck() {
    setInterval(() => {
      this.checkReminders();
    }, 60000);
  }

  checkReminders() {
    const now = new Date();
    const favors = this.favorManager.getFavors();
    
    favors.forEach(favor => {
      if (favor.status === 'pending' && favor.dueDate) {
        const dueDate = new Date(favor.dueDate);
        const diff = dueDate - now;
        const daysUntilDue = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue === 0 && !favor.reminderShown) {
          this.showNotification(`Favor due today: ${favor.title}`, favor.person);
          favor.reminderShown = true;
          Storage.saveFavors(favors);
        }
      }
    });
  }

  showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '🤝' });
    }
    UIRenderer.showToast(title, 'info', this.toastContainer);
  }
}