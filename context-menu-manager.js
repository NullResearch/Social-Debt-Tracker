/**
 * Social Debt Tracker - Context Menu Manager
 * Licensed under MIT License - see LICENSE file
 * Copyright (c) 2024 Null Research R&D
 */

export class ContextMenuManager {
  constructor(element) {
    this.element = element;
  }

  show(x, y) {
    this.element.classList.add('active');
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;

    // Adjust position if menu goes off screen
    const rect = this.element.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      this.element.style.left = `${x - rect.width}px`;
    }
    if (rect.bottom > window.innerHeight) {
      this.element.style.top = `${y - rect.height}px`;
    }
  }

  hide() {
    this.element.classList.remove('active');
  }
}