/**
 * Social Debt Tracker - Modal Manager
 * Licensed under MIT License - see LICENSE file
 * Copyright (c) 2024 Null Research R&D
 */

export class ModalManager {
  constructor(modals, callbacks) {
    this.modals = modals;
    this.callbacks = callbacks;
    this.currentFavorForComment = null;
    this.currentFavorForDelete = null;
    this.editingFavorId = null;
    this.avatarDataUrl = null;
    this.attachListeners();
  }

  attachListeners() {
    // Profile modal
    this.modals.profile.uploadAvatarBtn.addEventListener('click', () => {
      this.modals.profile.avatarInput.click();
    });
    this.modals.profile.avatarInput.addEventListener('change', (e) => {
      this.handleAvatarUpload(e);
    });
    this.modals.profile.removeAvatarBtn.addEventListener('click', () => {
      this.removeAvatar();
    });
    this.modals.profile.cancelBtn.addEventListener('click', () => this.closeProfile());
    this.modals.profile.saveBtn.addEventListener('click', () => {
      this.callbacks.onSaveProfile();
    });
    this.modals.profile.modal.addEventListener('click', (e) => {
      if (e.target === this.modals.profile.modal) this.closeProfile();
    });

    // Add favor modal
    this.modals.addFavor.cancelBtn.addEventListener('click', () => this.closeAddFavor());
    this.modals.addFavor.saveBtn.addEventListener('click', () => {
      this.callbacks.onSaveFavor();
    });
    this.modals.addFavor.modal.addEventListener('click', (e) => {
      if (e.target === this.modals.addFavor.modal) this.closeAddFavor();
    });

    // Leaderboard modal
    this.modals.leaderboard.closeBtn.addEventListener('click', () => this.closeLeaderboard());
    this.modals.leaderboard.modal.addEventListener('click', (e) => {
      if (e.target === this.modals.leaderboard.modal) this.closeLeaderboard();
    });

    // Comment modal
    this.modals.comment.saveBtn.addEventListener('click', () => {
      this.callbacks.onSaveComment(this.currentFavorForComment);
      this.currentFavorForComment = null;
    });
    this.modals.comment.cancelBtn.addEventListener('click', () => this.closeComment());
    this.modals.comment.modal.addEventListener('click', (e) => {
      if (e.target === this.modals.comment.modal) this.closeComment();
    });

    // Delete modal
    this.modals.delete.confirmBtn.addEventListener('click', () => {
      this.callbacks.onDeleteFavor(this.currentFavorForDelete);
      this.closeDelete();
    });
    this.modals.delete.cancelBtn.addEventListener('click', () => this.closeDelete());
    this.modals.delete.modal.addEventListener('click', (e) => {
      if (e.target === this.modals.delete.modal) this.closeDelete();
    });

    // About modal
    this.modals.about.closeBtn.addEventListener('click', () => this.closeAbout());
    this.modals.about.modal.addEventListener('click', (e) => {
      if (e.target === this.modals.about.modal) this.closeAbout();
    });
  }

  openProfile(profile, avatarUrl) {
    if (profile) {
      this.modals.profile.nameInput.value = profile.name || '';
      this.modals.profile.roleInput.value = profile.role || '';
      this.modals.profile.departmentInput.value = profile.department || '';
    }
    this.avatarDataUrl = avatarUrl;
    this.updateAvatarPreview();
    this.modals.profile.modal.classList.add('active');
    this.modals.profile.nameInput.focus();
  }

  handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarDataUrl = e.target.result;
      this.updateAvatarPreview();
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  removeAvatar() {
    this.avatarDataUrl = null;
    this.updateAvatarPreview();
  }

  updateAvatarPreview() {
    const preview = this.modals.profile.avatarPreview;
    const removeBtn = this.modals.profile.removeAvatarBtn;
    
    if (this.avatarDataUrl) {
      preview.innerHTML = `<img src="${this.avatarDataUrl}" alt="Avatar preview" />`;
      removeBtn.style.display = 'block';
    } else {
      const name = this.modals.profile.nameInput.value.trim();
      const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
      preview.innerHTML = `<div class="avatar-initials">${initials}</div>`;
      removeBtn.style.display = 'none';
    }
  }

  closeProfile() {
    if (this.callbacks.hasProfile()) {
      this.modals.profile.modal.classList.remove('active');
    }
  }

  openAddFavor() {
    this.editingFavorId = null;
    this.modals.addFavor.modal.querySelector('h3').textContent = 'Add Favor';
    this.modals.addFavor.modal.classList.add('active');
    this.modals.addFavor.titleInput.value = '';
    this.modals.addFavor.personInput.value = '';
    this.modals.addFavor.descriptionInput.value = '';
    this.modals.addFavor.valueInput.value = '';
    this.modals.addFavor.dueDateInput.value = '';
    this.modals.addFavor.tagsInput.value = '';
    this.modals.addFavor.titleInput.focus();
  }

  openEditFavor(favor) {
    this.editingFavorId = favor.id;
    this.modals.addFavor.modal.querySelector('h3').textContent = 'Edit Favor';
    this.modals.addFavor.modal.classList.add('active');
    this.modals.addFavor.titleInput.value = favor.title;
    this.modals.addFavor.personInput.value = favor.person;
    this.modals.addFavor.descriptionInput.value = favor.description || '';
    this.modals.addFavor.valueInput.value = favor.value || '';
    this.modals.addFavor.dueDateInput.value = favor.dueDate || '';
    this.modals.addFavor.tagsInput.value = (favor.tags || []).join(', ');
    document.querySelector(`input[name="direction"][value="${favor.direction}"]`).checked = true;
    this.modals.addFavor.titleInput.focus();
  }

  openDelete(favorId) {
    this.currentFavorForDelete = favorId;
    this.modals.delete.modal.classList.add('active');
  }

  closeDelete() {
    this.modals.delete.modal.classList.remove('active');
    this.currentFavorForDelete = null;
  }

  closeAddFavor() {
    this.modals.addFavor.modal.classList.remove('active');
  }

  openLeaderboard() {
    this.modals.leaderboard.modal.classList.add('active');
  }

  closeLeaderboard() {
    this.modals.leaderboard.modal.classList.remove('active');
  }

  openComment(favorId) {
    this.currentFavorForComment = favorId;
    this.modals.comment.input.value = '';
    this.modals.comment.modal.classList.add('active');
    this.modals.comment.input.focus();
  }

  closeComment() {
    this.modals.comment.modal.classList.remove('active');
    this.currentFavorForComment = null;
  }

  sanitizeInput(input, maxLength = 100) {
    if (typeof input !== 'string') return '';
    return input.trim().slice(0, maxLength);
  }

  getProfileData() {
    const name = this.sanitizeInput(this.modals.profile.nameInput.value, 100);
    const role = this.sanitizeInput(this.modals.profile.roleInput.value, 100);
    const department = this.sanitizeInput(this.modals.profile.departmentInput.value, 100);
    
    if (!name) {
      throw new Error('Name is required');
    }
    
    return { name, role, department };
  }

  getAvatarData() {
    return this.avatarDataUrl;
  }

  getFavorData() {
    const tagsInput = this.modals.addFavor.tagsInput.value;
    const tags = tagsInput
      .split(',')
      .map(t => this.sanitizeInput(t, 50))
      .filter(t => t)
      .slice(0, 20);

    const data = {
      title: this.sanitizeInput(this.modals.addFavor.titleInput.value, 200),
      person: this.sanitizeInput(this.modals.addFavor.personInput.value, 100),
      description: this.sanitizeInput(this.modals.addFavor.descriptionInput.value, 1000),
      value: parseInt(this.modals.addFavor.valueInput.value) || null,
      dueDate: this.modals.addFavor.dueDateInput.value || null,
      direction: document.querySelector('input[name="direction"]:checked').value,
      tags
    };

    if (this.editingFavorId !== null) {
      data.id = this.editingFavorId;
    }

    return data;
  }

  getCommentText() {
    return this.sanitizeInput(this.modals.comment.input.value, 500);
  }

  openAbout() {
    this.modals.about.modal.classList.add('active');
  }

  closeAbout() {
    this.modals.about.modal.classList.remove('active');
  }
}