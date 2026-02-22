/**
 * Social Debt Tracker - Dashboard Manager
 * Licensed under MIT License - see LICENSE file
 * Copyright (c) 2024 Null Research R&D
 */

import { UIRenderer } from './ui-renderer.js';

export class DashboardManager {
  constructor(elements, filterManager, viewManager) {
    this.elements = elements;
    this.filterManager = filterManager;
    this.viewManager = viewManager;
  }

  render(favors) {
    const filters = this.filterManager.getFilters();
    
    UIRenderer.updateDashboard(favors, this.elements.dashboard);
    UIRenderer.renderPersonFilter(favors, this.elements.personFilter, filters.person);
    
    const people = this.filterManager.getPeople(favors);
    UIRenderer.renderPeopleList(people, this.elements.peopleList, this.elements.emptyState);

    this.attachPersonCardListeners();
  }

  attachPersonCardListeners() {
    this.elements.peopleList.querySelectorAll('.person-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const person = e.currentTarget.dataset.person;
        this.viewManager.showPersonDetail(person);
      });
    });
  }
}