/**
 * Social Debt Tracker - Error Logger
 * Licensed under MIT License - see LICENSE file
 * Copyright (c) 2024 Null Research R&D
 */

export class ErrorLogger {
  static MAX_LOGS = 100;
  static STORAGE_KEY = 'errorLogs';

  static log(error, context = '') {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      stack: error.stack || '',
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const logs = this.getLogs();
    logs.unshift(errorLog);
    
    // Keep only the most recent logs
    if (logs.length > this.MAX_LOGS) {
      logs.splice(this.MAX_LOGS);
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save error log:', e);
    }

    // Also log to console in development
    console.error(`[${context}]`, error);
  }

  static getLogs() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load error logs:', e);
      return [];
    }
  }

  static clearLogs() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('Failed to clear error logs:', e);
      return false;
    }
  }

  static exportLogs() {
    const logs = this.getLogs();
    const text = logs.map(log => 
      `[${log.timestamp}] ${log.context}\n${log.message}\n${log.stack}\n---`
    ).join('\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static getStats() {
    const logs = this.getLogs();
    return {
      total: logs.length,
      last24h: logs.filter(log => {
        const logTime = new Date(log.timestamp);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return logTime > dayAgo;
      }).length
    };
  }
}

// Global error handler
window.addEventListener('error', (event) => {
  ErrorLogger.log(event.error || new Error(event.message), 'Global Error Handler');
});

window.addEventListener('unhandledrejection', (event) => {
  ErrorLogger.log(new Error(event.reason), 'Unhandled Promise Rejection');
});