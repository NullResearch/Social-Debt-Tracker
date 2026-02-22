/**
 * Social Debt Tracker - View Manager
 * Licensed under MIT License - see LICENSE file
 * Copyright (c) 2024 Null Research R&D
 */

import { UIRenderer } from './ui-renderer.js';

export class ViewManager {
  constructor(elements, favorManager, modalManager) {
    this.elements = elements;
    this.favorManager = favorManager;
    this.modalManager = modalManager;
    this.currentPerson = null;
    this.currentPage = 1;
    this.favorsPerPage = 10;
    this.attachListeners();
  }

  attachListeners() {
    this.elements.backBtn.addEventListener('click', () => this.showDashboard());
    
    this.elements.prevPageBtn.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderPersonDetail();
      }
    });

    this.elements.nextPageBtn.addEventListener('click', () => {
      const personFavors = this.favorManager.getFavors().filter(f => f.person === this.currentPerson);
      const totalPages = Math.ceil(personFavors.length / this.favorsPerPage);
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderPersonDetail();
      }
    });
  }

  showDashboard() {
    this.elements.dashboardView.classList.add('active');
    this.elements.detailView.classList.remove('active');
    this.currentPerson = null;
    if (this.onViewChange) this.onViewChange();
  }

  showPersonDetail(person) {
    this.currentPerson = person;
    this.currentPage = 1;
    this.elements.personName.textContent = person;
    this.elements.dashboardView.classList.remove('active');
    this.elements.detailView.classList.add('active');
    this.renderPersonDetail();
  }

  renderPersonDetail() {
    const personFavors = this.favorManager.getFavors()
      .filter(f => f.person === this.currentPerson)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalPages = Math.ceil(personFavors.length / this.favorsPerPage);
    const startIdx = (this.currentPage - 1) * this.favorsPerPage;
    const endIdx = startIdx + this.favorsPerPage;
    const paginatedFavors = personFavors.slice(startIdx, endIdx);

    UIRenderer.renderFavorsList(paginatedFavors, this.elements.favorsList);

    if (totalPages > 1) {
      this.elements.paginationControls.style.display = 'flex';
      this.elements.pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
      this.elements.prevPageBtn.disabled = this.currentPage === 1;
      this.elements.nextPageBtn.disabled = this.currentPage === totalPages;
    } else {
      this.elements.paginationControls.style.display = 'none';
    }

    this.attachFavorEventListeners();
  }

  attachFavorEventListeners() {
    this.elements.favorsList.querySelectorAll('.status-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.favorManager.toggleFavorStatus(id);
      });
    });

    this.elements.favorsList.querySelectorAll('.star').forEach(star => {
      star.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const rating = parseInt(e.target.dataset.rating);
        this.favorManager.setRating(id, rating);
      });
    });

    this.elements.favorsList.querySelectorAll('[data-comment]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.comment);
        this.modalManager.openComment(id);
      });
    });

    this.elements.favorsList.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.edit);
        if (this.onEditFavor) this.onEditFavor(id);
      });
    });

    this.elements.favorsList.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.delete);
        this.modalManager.openDelete(id);
      });
    });
  }

  handleUpdate() {
    if (this.currentPerson) {
      const personFavors = this.favorManager.getFavors().filter(f => f.person === this.currentPerson);
      const totalPages = Math.ceil(personFavors.length / this.favorsPerPage);
      if (this.currentPage > totalPages && this.currentPage > 1) {
        this.currentPage = totalPages;
      }
      this.renderPersonDetail();
    }
  }

  getCurrentPerson() {
    return this.currentPerson;
  }
}