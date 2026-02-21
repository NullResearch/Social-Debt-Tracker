/**
 * Social Debt Tracker - Event Handler
 * Licensed under MIT License - see LICENSE file
 * Copyright (c) 2024 Null Research R&D
 */

export class EventHandler {
  constructor(elements, filterManager) {
    this.elements = elements;
    this.filterManager = filterManager;
    this.callbacks = {};
  }

  attachDashboardListeners() {
    this.elements.addBtn.addEventListener('click', () => {
      if (this.callbacks.onAddFavor) this.callbacks.onAddFavor();
    });

    this.elements.aboutBtn.addEventListener('click', () => {
      if (this.callbacks.onAbout) this.callbacks.onAbout();
    });

    this.elements.profileBtn.addEventListener('click', () => {
      if (this.callbacks.onProfile) this.callbacks.onProfile();
    });

    this.elements.themeToggle.addEventListener('click', () => {
      if (this.callbacks.onThemeToggle) this.callbacks.onThemeToggle();
    });

    this.elements.leaderboardBtn.addEventListener('click', () => {
      if (this.callbacks.onLeaderboard) this.callbacks.onLeaderboard();
    });

    this.elements.exportBtn.addEventListener('click', () => {
      if (this.callbacks.onExport) this.callbacks.onExport();
    });

    this.elements.importBtn.addEventListener('click', () => {
      if (this.callbacks.onImport) {
        this.callbacks.onImport();
      }
    });
  }

  attachFilterListeners() {
    this.elements.searchInput.addEventListener('input', (e) => {
      this.filterManager.setSearchFilter(e.target.value);
      if (this.callbacks.onFilterChange) this.callbacks.onFilterChange();
    });

    this.elements.personFilter.addEventListener('change', (e) => {
      this.filterManager.setPersonFilter(e.target.value);
      if (this.callbacks.onFilterChange) this.callbacks.onFilterChange();
    });

    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.filterManager.setStatusFilter(e.target.dataset.status);
        if (this.callbacks.onFilterChange) this.callbacks.onFilterChange();
      });
    });
  }

  attachContextMenuListeners() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.callbacks.onContextMenu) {
        this.callbacks.onContextMenu(e.clientX, e.clientY);
      }
    });

    document.addEventListener('click', () => {
      if (this.callbacks.onHideContextMenu) {
        this.callbacks.onHideContextMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.callbacks.onHideContextMenu) {
        this.callbacks.onHideContextMenu();
      }
    });

    this.elements.contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        if (this.callbacks.onContextMenuAction) {
          this.callbacks.onContextMenuAction(action);
        }
      });
    });
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }
}