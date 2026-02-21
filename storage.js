/**
 * Social Debt Tracker - Storage Manager
 * Licensed under MIT License - see LICENSE file
 * Copyright (c) 2024 Null Research R&D
 */

export class Storage {
  static loadFavors() {
    const saved = localStorage.getItem('favorTracker');
    return saved ? JSON.parse(saved) : [];
  }

  static saveFavors(favors) {
    localStorage.setItem('favorTracker', JSON.stringify(favors));
  }

  static loadProfile() {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  }

  static saveProfile(profile) {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }

  static saveAvatarImage(dataUrl) {
    localStorage.setItem('userAvatar', dataUrl);
  }

  static loadAvatarImage() {
    return localStorage.getItem('userAvatar');
  }

  static removeAvatarImage() {
    localStorage.removeItem('userAvatar');
  }
}