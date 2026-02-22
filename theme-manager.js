import { UIRenderer } from './ui-renderer.js';

export class ThemeManager {
  constructor(toastContainer) {
    this.toastContainer = toastContainer;
    this.loadTheme();
  }

  loadTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    }
  }

  toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    UIRenderer.showToast(
      `${isDark ? 'Dark' : 'Light'} mode enabled`,
      'info',
      this.toastContainer
    );
  }
}