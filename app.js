/**
 * Social Debt Tracker - Main Application
 * Licensed under MIT License - see LICENSE file
 * Copyright (c) 2024 Null Research R&D
 */

import { UIRenderer } from './ui-renderer.js';
import { ModalManager } from './modal-manager.js';
import { FavorManager } from './favor-manager.js';
import { FilterManager } from './filter-manager.js';
import { ImportExportManager } from './import-export-manager.js';
import { NotificationManager } from './notification-manager.js';
import { ThemeManager } from './theme-manager.js';
import { ErrorLogger } from './error-logger.js';
import { SettingsManager } from './settings-manager.js';
import { ViewManager } from './view-manager.js';
import { EventHandler } from './event-handler.js';
import { ContextMenuManager } from './context-menu-manager.js';
import { ProfileManager } from './profile-manager.js';
import { DashboardManager } from './dashboard-manager.js';

class FavorTracker {
  constructor() {
    this.initElements();
    this.initManagers();
    this.initModals();
    this.setupEventHandlers();
    this.checkProfile();
    this.render();
    this.hideLoadingScreen();
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 2000);
  }

  initElements() {
    this.dashboardView = document.getElementById('dashboardView');
    this.detailView = document.getElementById('detailView');
    this.peopleList = document.getElementById('peopleList');
    this.favorsList = document.getElementById('favorsList');
    this.emptyState = document.getElementById('emptyState');
    this.backBtn = document.getElementById('backBtn');
    this.aboutBtn = document.getElementById('aboutBtn');
    this.profileBtn = document.getElementById('profileBtn');
    this.themeToggle = document.getElementById('themeToggle');
    this.leaderboardBtn = document.getElementById('leaderboardBtn');
    this.addBtn = document.getElementById('addBtn');
    this.exportBtn = document.getElementById('exportBtn');
    this.importBtn = document.getElementById('importBtn');
    this.importInput = document.getElementById('importFileInput');
    this.importModal = document.getElementById('importModal');
    this.importDropZone = document.getElementById('importDropZone');
    this.selectFileBtn = document.getElementById('selectFileBtn');
    this.cancelImportBtn = document.getElementById('cancelImportBtn');
    this.personName = document.getElementById('personName');
    this.userInfo = document.getElementById('userInfo');
    this.searchInput = document.getElementById('searchInput');
    this.personFilter = document.getElementById('personFilter');
    this.toastContainer = document.getElementById('toastContainer');
    this.paginationControls = document.getElementById('paginationControls');
    this.prevPageBtn = document.getElementById('prevPageBtn');
    this.nextPageBtn = document.getElementById('nextPageBtn');
    this.pageInfo = document.getElementById('pageInfo');
    this.contextMenu = document.getElementById('contextMenu');
    
    this.dashboardElements = {
      totalBalance: document.getElementById('totalBalance'),
      totalOwed: document.getElementById('totalOwed'),
      totalOwe: document.getElementById('totalOwe'),
      activeFavors: document.getElementById('activeFavors'),
      completedFavors: document.getElementById('completedFavors')
    };
  }

  initManagers() {
    this.profileManager = new ProfileManager(this.toastContainer);
    this.favorManager = new FavorManager(() => this.handleUpdate(), this.toastContainer);
    this.filterManager = new FilterManager();
    this.importExportManager = new ImportExportManager(this.favorManager, this.toastContainer);
    this.notificationManager = new NotificationManager(this.favorManager, this.toastContainer);
    this.themeManager = new ThemeManager(this.toastContainer);
    this.contextMenuManager = new ContextMenuManager(this.contextMenu);
    
    this.settingsManager = new SettingsManager(
      {
        modal: document.getElementById('settingsModal'),
        closeBtn: document.getElementById('closeSettingsBtn'),
        clearAllDataBtn: document.getElementById('clearAllDataBtn'),
        clearFavorsBtn: document.getElementById('clearFavorsBtn'),
        clearProfileBtn: document.getElementById('clearProfileBtn'),
        viewErrorsBtn: document.getElementById('viewErrorsBtn'),
        exportErrorsBtn: document.getElementById('exportErrorsBtn'),
        clearErrorsBtn: document.getElementById('clearErrorsBtn'),
        errorStatsText: document.getElementById('errorStatsText'),
        errorLogsModal: document.getElementById('errorLogsModal'),
        closeErrorLogsBtn: document.getElementById('closeErrorLogsBtn'),
        errorLogsList: document.getElementById('errorLogsList'),
        confirmClearModal: document.getElementById('confirmClearModal'),
        confirmClearMessage: document.getElementById('confirmClearMessage'),
        confirmClearBtn: document.getElementById('confirmClearBtn'),
        cancelClearBtn: document.getElementById('cancelClearBtn')
      },
      this.favorManager,
      this.toastContainer
    );

    this.settingsManager.onDataCleared = () => this.render();
    this.settingsManager.onProfileCleared = () => {
      this.profileManager.clearProfile();
      this.checkProfile();
    };
  }

  initModals() {
    this.setupImportModal();
    
    this.modalManager = new ModalManager(
      {
        profile: {
          modal: document.getElementById('profileModal'),
          nameInput: document.getElementById('nameInput'),
          roleInput: document.getElementById('roleInput'),
          departmentInput: document.getElementById('departmentInput'),
          avatarInput: document.getElementById('avatarInput'),
          avatarPreview: document.getElementById('avatarPreview'),
          uploadAvatarBtn: document.getElementById('uploadAvatarBtn'),
          removeAvatarBtn: document.getElementById('removeAvatarBtn'),
          saveBtn: document.getElementById('saveProfileBtn'),
          cancelBtn: document.getElementById('cancelProfileBtn')
        },
        addFavor: {
          modal: document.getElementById('addModal'),
          titleInput: document.getElementById('titleInput'),
          personInput: document.getElementById('personInput'),
          descriptionInput: document.getElementById('descriptionInput'),
          valueInput: document.getElementById('valueInput'),
          dueDateInput: document.getElementById('dueDateInput'),
          tagsInput: document.getElementById('tagsInput'),
          saveBtn: document.getElementById('saveBtn'),
          cancelBtn: document.getElementById('cancelBtn')
        },
        leaderboard: {
          modal: document.getElementById('leaderboardModal'),
          list: document.getElementById('leaderboardList'),
          closeBtn: document.getElementById('closeLeaderboardBtn')
        },
        comment: {
          modal: document.getElementById('commentModal'),
          input: document.getElementById('commentInput'),
          saveBtn: document.getElementById('saveCommentBtn'),
          cancelBtn: document.getElementById('cancelCommentBtn')
        },
        delete: {
          modal: document.getElementById('deleteModal'),
          confirmBtn: document.getElementById('confirmDeleteBtn'),
          cancelBtn: document.getElementById('cancelDeleteBtn')
        },
        about: {
          modal: document.getElementById('aboutModal'),
          closeBtn: document.getElementById('closeAboutBtn')
        }
      },
      {
        onSaveProfile: () => this.saveProfile(),
        onSaveFavor: () => this.saveFavor(),
        onSaveComment: (favorId) => this.saveComment(favorId),
        onDeleteFavor: (favorId) => this.deleteFavor(favorId),
        hasProfile: () => this.profileManager.hasProfile()
      }
    );

    this.viewManager = new ViewManager(
      {
        dashboardView: this.dashboardView,
        detailView: this.detailView,
        personName: this.personName,
        favorsList: this.favorsList,
        paginationControls: this.paginationControls,
        prevPageBtn: this.prevPageBtn,
        nextPageBtn: this.nextPageBtn,
        pageInfo: this.pageInfo,
        backBtn: this.backBtn
      },
      this.favorManager,
      this.modalManager
    );

    this.viewManager.onViewChange = () => this.render();
    this.viewManager.onEditFavor = (id) => this.editFavor(id);

    this.dashboardManager = new DashboardManager(
      {
        dashboard: this.dashboardElements,
        personFilter: this.personFilter,
        peopleList: this.peopleList,
        emptyState: this.emptyState
      },
      this.filterManager,
      this.viewManager
    );
  }

  setupImportModal() {
    this.selectFileBtn.addEventListener('click', () => {
      this.importInput.click();
    });

    this.importInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        this.importExportManager.importCSV(e.target.files[0]);
        this.closeImportModal();
        e.target.value = '';
      }
    });

    this.importDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.importDropZone.classList.add('drag-over');
    });

    this.importDropZone.addEventListener('dragleave', () => {
      this.importDropZone.classList.remove('drag-over');
    });

    this.importDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.importDropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.csv')) {
        this.importExportManager.importCSV(file);
        this.closeImportModal();
      } else {
        UIRenderer.showToast('Please drop a CSV file', 'info', this.toastContainer);
      }
    });

    this.cancelImportBtn.addEventListener('click', () => {
      this.closeImportModal();
    });

    this.importModal.addEventListener('click', (e) => {
      if (e.target === this.importModal) {
        this.closeImportModal();
      }
    });
  }

  openImportModal() {
    this.importModal.classList.add('active');
  }

  closeImportModal() {
    this.importModal.classList.remove('active');
  }

  setupEventHandlers() {
    this.eventHandler = new EventHandler(
      {
        addBtn: this.addBtn,
        aboutBtn: this.aboutBtn,
        profileBtn: this.profileBtn,
        themeToggle: this.themeToggle,
        leaderboardBtn: this.leaderboardBtn,
        exportBtn: this.exportBtn,
        importBtn: this.importBtn,
        importInput: this.importInput,
        searchInput: this.searchInput,
        personFilter: this.personFilter,
        contextMenu: this.contextMenu
      },
      this.filterManager
    );

    this.eventHandler.on('onAddFavor', () => this.modalManager.openAddFavor());
    this.eventHandler.on('onAbout', () => this.modalManager.openAbout());
    this.eventHandler.on('onProfile', () => this.openProfileModal());
    this.eventHandler.on('onThemeToggle', () => this.themeManager.toggleTheme());
    this.eventHandler.on('onLeaderboard', () => this.openLeaderboard());
    this.eventHandler.on('onExport', () => this.importExportManager.exportCSV());
    this.eventHandler.on('onImport', () => this.openImportModal());
    this.eventHandler.on('onFilterChange', () => this.render());
    this.eventHandler.on('onContextMenu', (x, y) => this.contextMenuManager.show(x, y));
    this.eventHandler.on('onHideContextMenu', () => this.contextMenuManager.hide());
    this.eventHandler.on('onContextMenuAction', (action) => this.handleContextMenuAction(action));
    
    window.ErrorLogger = ErrorLogger;

    this.eventHandler.attachDashboardListeners();
    this.eventHandler.attachFilterListeners();
    this.eventHandler.attachContextMenuListeners();
  }

  checkProfile() {
    if (!this.profileManager.hasProfile()) {
      this.openProfileModal();
    } else {
      this.profileManager.renderUserInfo(this.userInfo);
    }
  }

  openProfileModal() {
    this.modalManager.openProfile(
      this.profileManager.getProfile(),
      this.profileManager.getAvatarUrl()
    );
  }

  saveProfile() {
    const profileData = this.modalManager.getProfileData();
    const avatarData = this.modalManager.getAvatarData();
    
    if (this.profileManager.saveProfile(profileData, avatarData)) {
      this.profileManager.renderUserInfo(this.userInfo);
      this.modalManager.closeProfile();
    }
  }

  openLeaderboard() {
    const people = this.filterManager.getPeople(this.favorManager.getFavors());
    UIRenderer.renderLeaderboard(people, this.modalManager.modals.leaderboard.list);
    this.modalManager.openLeaderboard();
  }

  saveComment(favorId) {
    const comment = this.modalManager.getCommentText();
    if (!comment || !favorId) return;

    if (this.favorManager.addComment(favorId, comment)) {
      this.viewManager.renderPersonDetail();
      this.modalManager.closeComment();
    }
  }

  saveFavor() {
    try {
      const data = this.modalManager.getFavorData();
      if (!data.title || !data.person) {
        UIRenderer.showToast('Title and person are required', 'info', this.toastContainer);
        return;
      }

      if (data.id) {
        if (this.favorManager.editFavor(data)) {
          this.modalManager.closeAddFavor();
          this.viewManager.renderPersonDetail();
        }
      } else {
        this.favorManager.addFavor(data);
        this.modalManager.closeAddFavor();
        this.render();
      }
    } catch (error) {
      ErrorLogger.log(error, 'Favor - Save');
      UIRenderer.showToast(error.message, 'info', this.toastContainer);
    }
  }

  editFavor(id) {
    const favor = this.favorManager.getFavor(id);
    if (favor) {
      this.modalManager.openEditFavor(favor);
    }
  }

  deleteFavor(id) {
    if (this.favorManager.deleteFavor(id)) {
      this.viewManager.handleUpdate();
    }
  }

  handleContextMenuAction(action) {
    switch (action) {
      case 'add':
        this.modalManager.openAddFavor();
        break;
      case 'leaderboard':
        this.openLeaderboard();
        break;
      case 'export':
        this.importExportManager.exportCSV();
        break;
      case 'import':
        this.openImportModal();
        break;
      case 'theme':
        this.themeManager.toggleTheme();
        break;
      case 'profile':
        this.openProfileModal();
        break;
      case 'settings':
        this.settingsManager.open();
        break;
      case 'about':
        this.modalManager.openAbout();
        break;
    }
    this.contextMenuManager.hide();
  }

  handleUpdate() {
    if (this.viewManager.getCurrentPerson()) {
      this.viewManager.handleUpdate();
    } else {
      this.render();
    }
  }

  render() {
    this.dashboardManager.render(this.favorManager.getFavors());
  }
}

new FavorTracker();