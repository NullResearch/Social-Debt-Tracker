/**
 * Social Debt Tracker - Profile Manager
 * Licensed under MIT License - see LICENSE file
 * Copyright (c) 2024 Null Research R&D
 */

import { Storage } from './storage.js';
import { UIRenderer } from './ui-renderer.js';
import { ErrorLogger } from './error-logger.js';

export class ProfileManager {
  constructor(toastContainer) {
    this.toastContainer = toastContainer;
    this.profile = Storage.loadProfile();
    this.avatarUrl = Storage.loadAvatarImage();
  }

  getProfile() {
    return this.profile;
  }

  getAvatarUrl() {
    return this.avatarUrl;
  }

  hasProfile() {
    return this.profile !== null;
  }

  saveProfile(profileData, avatarData) {
    try {
      if (!profileData.name) {
        throw new Error('Name is required');
      }

      this.profile = profileData;
      Storage.saveProfile(this.profile);
      
      if (avatarData) {
        if (avatarData.length > 5 * 1024 * 1024) {
          throw new Error('Avatar image too large (max 5MB)');
        }
        Storage.saveAvatarImage(avatarData);
        this.avatarUrl = avatarData;
      } else if (avatarData === null) {
        Storage.removeAvatarImage();
        this.avatarUrl = null;
      }
      
      UIRenderer.showToast('Profile saved', 'success', this.toastContainer);
      return true;
    } catch (error) {
      ErrorLogger.log(error, 'Profile - Save');
      UIRenderer.showToast(error.message, 'info', this.toastContainer);
      return false;
    }
  }

  clearProfile() {
    this.profile = null;
    this.avatarUrl = null;
  }

  renderUserInfo(container) {
    UIRenderer.renderUserInfo(this.profile, container, this.avatarUrl);
  }
}