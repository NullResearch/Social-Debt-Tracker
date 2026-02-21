/**
 * Social Debt Tracker - Settings Manager
 * Licensed under MIT License - see LICENSE file
 * Copyright (c) 2024 Null Research R&D
 */

import { UIRenderer } from './ui-renderer.js';
import { ErrorLogger } from './error-logger.js';

export class SettingsManager {
  constructor(elements, favorManager, toastContainer) {
    this.elements = elements;
    this.favorManager = favorManager;
    this.toastContainer = toastContainer;
    this.clearDataType = null;
    this.attachListeners();
  }

  attachListeners() {
    this.elements.closeBtn.addEventListener('click', () => this.close());
    this.elements.modal.addEventListener('click', (e) => {
      if (e.target === this.elements.modal) this.close();
    });
    
    this.elements.clearAllDataBtn.addEventListener('click', () => this.confirmClear('all'));
    this.elements.clearFavorsBtn.addEventListener('click', () => this.confirmClear('favors'));
    this.elements.clearProfileBtn.addEventListener('click', () => this.confirmClear('profile'));
    this.elements.viewErrorsBtn.addEventListener('click', () => this.viewErrorLogs());
    this.elements.exportErrorsBtn.addEventListener('click', () => this.exportErrorLogs());
    this.elements.clearErrorsBtn.addEventListener('click', () => this.clearErrorLogs());
    
    this.elements.closeErrorLogsBtn.addEventListener('click', () => this.closeErrorLogs());
    this.elements.errorLogsModal.addEventListener('click', (e) => {
      if (e.target === this.elements.errorLogsModal) this.closeErrorLogs();
    });
    
    this.elements.cancelClearBtn.addEventListener('click', () => this.closeConfirmClear());
    this.elements.confirmClearBtn.addEventListener('click', () => this.executeClear());
    this.elements.confirmClearModal.addEventListener('click', (e) => {
      if (e.target === this.elements.confirmClearModal) this.closeConfirmClear();
    });
  }

  open() {
    try {
      const stats = ErrorLogger.getStats();
      this.elements.errorStatsText.textContent = `Total errors: ${stats.total} | Last 24h: ${stats.last24h}`;
      this.elements.modal.classList.add('active');
    } catch (error) {
      ErrorLogger.log(error, 'Settings - Open');
      UIRenderer.showToast('Error opening settings', 'info', this.toastContainer);
    }
  }

  close() {
    this.elements.modal.classList.remove('active');
  }

  confirmClear(type) {
    this.clearDataType = type;
    let message = '';
    
    switch (type) {
      case 'all':
        message = 'Are you sure you want to clear ALL data? This will delete your profile, all favors, and cannot be undone.';
        break;
      case 'favors':
        message = 'Are you sure you want to clear all favors? Your profile will remain. This cannot be undone.';
        break;
      case 'profile':
        message = 'Are you sure you want to clear your profile? Your favors will remain. This cannot be undone.';
        break;
    }
    
    this.elements.confirmClearMessage.textContent = message;
    this.elements.confirmClearModal.classList.add('active');
  }

  closeConfirmClear() {
    this.elements.confirmClearModal.classList.remove('active');
    this.clearDataType = null;
  }

  executeClear() {
    try {
      switch (this.clearDataType) {
        case 'all':
          localStorage.clear();
          UIRenderer.showToast('All data cleared', 'success', this.toastContainer);
          setTimeout(() => window.location.reload(), 1000);
          break;
        case 'favors':
          localStorage.removeItem('favorTracker');
          this.favorManager.favors = [];
          UIRenderer.showToast('Favors cleared', 'success', this.toastContainer);
          if (this.onDataCleared) this.onDataCleared();
          break;
        case 'profile':
          localStorage.removeItem('userProfile');
          localStorage.removeItem('userAvatar');
          UIRenderer.showToast('Profile cleared', 'success', this.toastContainer);
          if (this.onProfileCleared) this.onProfileCleared();
          break;
      }
      this.closeConfirmClear();
      this.close();
    } catch (error) {
      ErrorLogger.log(error, 'Settings - Clear Data');
      UIRenderer.showToast('Error clearing data', 'info', this.toastContainer);
    }
  }

  viewErrorLogs() {
    try {
      const logs = ErrorLogger.getLogs();
      
      if (logs.length === 0) {
        this.elements.errorLogsList.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-tertiary);">No error logs</div>';
      } else {
        this.elements.errorLogsList.innerHTML = logs.map(log => `
          <div class="error-log-item">
            <div class="error-log-time">${new Date(log.timestamp).toLocaleString()}</div>
            <div class="error-log-context">${UIRenderer.escapeHtml(log.context)}</div>
            <div class="error-log-message">${UIRenderer.escapeHtml(log.message)}</div>
            ${log.stack ? `<div class="error-log-stack">${UIRenderer.escapeHtml(log.stack.slice(0, 500))}</div>` : ''}
          </div>
        `).join('');
      }
      
      this.elements.errorLogsModal.classList.add('active');
    } catch (error) {
      ErrorLogger.log(error, 'Settings - View Logs');
      UIRenderer.showToast('Error viewing logs', 'info', this.toastContainer);
    }
  }

  closeErrorLogs() {
    this.elements.errorLogsModal.classList.remove('active');
  }

  exportErrorLogs() {
    try {
      ErrorLogger.exportLogs();
      UIRenderer.showToast('Error logs exported', 'success', this.toastContainer);
    } catch (error) {
      ErrorLogger.log(error, 'Settings - Export Logs');
      UIRenderer.showToast('Error exporting logs', 'info', this.toastContainer);
    }
  }

  clearErrorLogs() {
    try {
      if (ErrorLogger.clearLogs()) {
        UIRenderer.showToast('Error logs cleared', 'success', this.toastContainer);
        this.open(); // Refresh stats
      }
    } catch (error) {
      ErrorLogger.log(error, 'Settings - Clear Logs');
      UIRenderer.showToast('Error clearing logs', 'info', this.toastContainer);
    }
  }
}