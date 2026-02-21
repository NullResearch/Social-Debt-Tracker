/**
 * Social Debt Tracker - Favor Manager
 * Licensed under MIT License - see LICENSE file
 * Copyright (c) 2024 Null Research R&D
 */

import { Storage } from './storage.js';
import { UIRenderer } from './ui-renderer.js';

export class FavorManager {
  constructor(onUpdate, toastContainer) {
    this.favors = Storage.loadFavors();
    this.onUpdate = onUpdate;
    this.toastContainer = toastContainer;
  }

  static sanitizeInput(input, maxLength = 500) {
    if (typeof input !== 'string') return '';
    return input.trim().slice(0, maxLength);
  }

  static validateFavorData(data) {
    if (!data.title || !data.person) {
      throw new Error('Title and person are required');
    }
    
    if (data.title.length > 200) {
      throw new Error('Title is too long (max 200 characters)');
    }
    
    if (data.person.length > 100) {
      throw new Error('Person name is too long (max 100 characters)');
    }
    
    if (data.description && data.description.length > 1000) {
      throw new Error('Description is too long (max 1000 characters)');
    }
    
    if (data.value && (data.value < 0 || data.value > 999999)) {
      throw new Error('Value must be between 0 and 999999');
    }
    
    if (data.tags && data.tags.length > 20) {
      throw new Error('Too many tags (max 20)');
    }
    
    return true;
  }

  getFavors() {
    return this.favors;
  }

  addFavor(data) {
    // Sanitize all inputs
    const sanitizedData = {
      title: FavorManager.sanitizeInput(data.title, 200),
      person: FavorManager.sanitizeInput(data.person, 100),
      description: data.description ? FavorManager.sanitizeInput(data.description, 1000) : '',
      direction: data.direction === 'owe' || data.direction === 'owed' ? data.direction : 'owe',
      value: data.value ? Math.max(0, Math.min(999999, parseInt(data.value) || 0)) : null,
      dueDate: data.dueDate || null,
      tags: data.tags ? data.tags.slice(0, 20).map(t => FavorManager.sanitizeInput(t, 50)) : []
    };
    
    // Validate
    FavorManager.validateFavorData(sanitizedData);
    
    this.favors.push({
      id: Date.now(),
      ...sanitizedData,
      date: new Date().toISOString(),
      status: 'pending',
      comments: [],
      rating: 0
    });
    Storage.saveFavors(this.favors);
    this.onUpdate();
    UIRenderer.showToast(`Favor "${sanitizedData.title}" added`, 'success', this.toastContainer);
  }

  editFavor(data) {
    const index = this.favors.findIndex(f => f.id === data.id);
    if (index !== -1) {
      // Sanitize all inputs
      const sanitizedData = {
        id: data.id,
        title: FavorManager.sanitizeInput(data.title, 200),
        person: FavorManager.sanitizeInput(data.person, 100),
        description: data.description ? FavorManager.sanitizeInput(data.description, 1000) : '',
        direction: data.direction === 'owe' || data.direction === 'owed' ? data.direction : 'owe',
        value: data.value ? Math.max(0, Math.min(999999, parseInt(data.value) || 0)) : null,
        dueDate: data.dueDate || null,
        tags: data.tags ? data.tags.slice(0, 20).map(t => FavorManager.sanitizeInput(t, 50)) : []
      };
      
      // Validate
      FavorManager.validateFavorData(sanitizedData);
      
      this.favors[index] = { ...this.favors[index], ...sanitizedData };
      Storage.saveFavors(this.favors);
      this.onUpdate();
      UIRenderer.showToast('Favor updated', 'success', this.toastContainer);
      return true;
    }
    return false;
  }

  deleteFavor(id) {
    const index = this.favors.findIndex(f => f.id === id);
    if (index !== -1) {
      this.favors.splice(index, 1);
      Storage.saveFavors(this.favors);
      this.onUpdate();
      UIRenderer.showToast('Favor deleted', 'info', this.toastContainer);
      return true;
    }
    return false;
  }

  toggleFavorStatus(id) {
    const favor = this.favors.find(f => f.id === id);
    if (favor) {
      const newStatus = favor.status === 'pending' ? 'completed' : 'pending';
      favor.status = newStatus;
      Storage.saveFavors(this.favors);
      this.onUpdate();
      UIRenderer.showToast(
        newStatus === 'completed' ? 'Favor marked as completed' : 'Favor marked as pending',
        'info',
        this.toastContainer
      );
      return true;
    }
    return false;
  }

  setRating(favorId, rating) {
    const favor = this.favors.find(f => f.id === favorId);
    if (favor) {
      favor.rating = rating;
      Storage.saveFavors(this.favors);
      this.onUpdate();
      return true;
    }
    return false;
  }

  addComment(favorId, comment) {
    const favor = this.favors.find(f => f.id === favorId);
    if (favor) {
      const sanitizedComment = FavorManager.sanitizeInput(comment, 500);
      
      if (!sanitizedComment) {
        UIRenderer.showToast('Comment cannot be empty', 'info', this.toastContainer);
        return false;
      }
      
      if (!favor.comments) favor.comments = [];
      
      // Limit total comments per favor
      if (favor.comments.length >= 50) {
        UIRenderer.showToast('Maximum comments reached (50)', 'info', this.toastContainer);
        return false;
      }
      
      favor.comments.push({
        text: sanitizedComment,
        date: new Date().toISOString()
      });
      Storage.saveFavors(this.favors);
      this.onUpdate();
      UIRenderer.showToast('Comment added', 'success', this.toastContainer);
      return true;
    }
    return false;
  }

  getFavor(id) {
    return this.favors.find(f => f.id === id);
  }
}