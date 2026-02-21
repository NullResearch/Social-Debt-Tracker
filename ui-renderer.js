export class UIRenderer {
  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  static formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  static isDueSoon(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    const daysUntilDue = Math.floor(diff / (1000 * 60 * 60 * 24));
    return daysUntilDue >= 0 && daysUntilDue <= 3;
  }

  static renderUserInfo(profile, container, avatarUrl) {
    if (!profile) return;

    const details = [profile.role, profile.department]
      .filter(Boolean)
      .join(' • ');

    const avatarHtml = avatarUrl 
      ? `<img src="${avatarUrl}" alt="Avatar" class="user-avatar-img" />`
      : `<div class="user-avatar-initials">${this.getInitials(profile.name)}</div>`;

    container.innerHTML = `
      <div class="user-info-content">
        <div class="user-avatar">${avatarHtml}</div>
        <div class="user-text">
          <div class="user-name">${this.escapeHtml(profile.name)}</div>
          ${details ? `<div class="user-details">${this.escapeHtml(details)}</div>` : ''}
        </div>
      </div>
    `;
  }

  static getInitials(name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  static updateDashboard(favors, elements) {
    let totalOweValue = 0;
    let totalOwedValue = 0;
    let activeCount = 0;
    let completedCount = 0;

    favors.forEach(favor => {
      const value = favor.value || 1;
      if (favor.status === 'pending') {
        activeCount++;
        if (favor.direction === 'owe') {
          totalOweValue += value;
        } else {
          totalOwedValue += value;
        }
      } else {
        completedCount++;
      }
    });

    const balance = totalOwedValue - totalOweValue;
    
    elements.totalBalance.textContent = balance >= 0 ? `+${balance}` : balance;
    elements.totalOwed.textContent = totalOwedValue;
    elements.totalOwe.textContent = totalOweValue;
    elements.activeFavors.textContent = activeCount;
    elements.completedFavors.textContent = completedCount;
  }

  static renderPeopleList(people, container, emptyState) {
    if (people.length === 0) {
      emptyState.style.display = 'flex';
      container.innerHTML = '';
      return;
    }

    emptyState.style.display = 'none';

    container.innerHTML = people.map(person => {
      const balanceClass = person.balance > 0 ? 'positive' : person.balance < 0 ? 'negative' : 'neutral';
      const balanceText = person.balance > 0 ? `+${person.balance}` : person.balance;
      const unsettled = person.oweValue + person.owedValue;

      return `
        <div class="person-card" data-person="${this.escapeHtml(person.name)}">
          <div class="person-info">
            <div class="person-name">${this.escapeHtml(person.name)}</div>
            <div class="person-count">${unsettled} total value</div>
          </div>
          <div class="person-balance ${balanceClass}">${balanceText}</div>
        </div>
      `;
    }).join('');
  }

  static renderPersonFilter(favors, container, currentFilter) {
    const allPeople = [...new Set(favors.map(f => f.person))].sort();
    container.innerHTML = `
      <option value="">All People</option>
      ${allPeople.map(person => `
        <option value="${this.escapeHtml(person)}" ${currentFilter === person ? 'selected' : ''}>
          ${this.escapeHtml(person)}
        </option>
      `).join('')}
    `;
  }

  static renderFavorsList(favors, container) {
    container.innerHTML = favors.map(favor => {
      const isPending = favor.status === 'pending';
      const hasValue = favor.value !== null && favor.value !== undefined;
      const hasDueDate = favor.dueDate && favor.dueDate.length > 0;
      const hasReminder = hasDueDate && isPending && this.isDueSoon(favor.dueDate);
      
      return `
        <div class="favor-item ${!isPending ? 'completed' : ''}">
          <div class="favor-header">
            <span class="favor-direction ${favor.direction}">
              ${favor.direction === 'owe' ? 'You owe' : 'They owe you'}
              ${hasReminder ? '<span class="reminder-badge">DUE SOON</span>' : ''}
            </span>
          </div>
          <div class="favor-title">${this.escapeHtml(favor.title)}</div>
          ${favor.description ? `<div class="favor-description">${this.escapeHtml(favor.description)}</div>` : ''}
          ${favor.tags && favor.tags.length > 0 ? `
            <div class="favor-tags">
              ${favor.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
            </div>
          ` : ''}
          <div class="favor-rating">
            ${[1, 2, 3, 4, 5].map(n => `
              <span class="star ${(favor.rating || 0) >= n ? 'filled' : ''}" data-id="${favor.id}" data-rating="${n}">★</span>
            `).join('')}
          </div>
          ${hasValue || hasDueDate ? `
            <div class="favor-meta">
              ${hasValue ? `<span class="favor-value">Value: ${favor.value}</span>` : ''}
              ${hasDueDate ? `<span>Due: ${this.formatDate(favor.dueDate)}</span>` : ''}
            </div>
          ` : ''}
          <div class="favor-footer">
            <span class="favor-date">${this.formatDate(favor.date)}</span>
            <button class="status-toggle" data-id="${favor.id}">
              ${isPending ? 'Mark Complete' : 'Completed'}
            </button>
          </div>
          <div class="favor-actions">
            <button class="action-btn" data-comment="${favor.id}">💬 Comment</button>
            <button class="action-btn edit-btn" data-edit="${favor.id}">✏️ Edit</button>
            <button class="action-btn delete-btn" data-delete="${favor.id}">🗑️ Delete</button>
          </div>
          ${favor.comments && favor.comments.length > 0 ? `
            <div class="favor-comments">
              ${favor.comments.map(c => `
                <div class="comment-item">
                  ${this.escapeHtml(c.text)}
                  <div class="comment-date">${this.formatDate(c.date)}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  static renderLeaderboard(people, container) {
    const sorted = people
      .map(p => ({
        name: p.name,
        score: p.owedValue + p.oweValue,
        balance: p.balance
      }))
      .sort((a, b) => b.score - a.score);

    container.innerHTML = sorted.map((person, index) => `
      <div class="leaderboard-item">
        <div class="leaderboard-rank">${index + 1}</div>
        <div class="leaderboard-info">
          <div class="leaderboard-name">${this.escapeHtml(person.name)}</div>
          <div class="leaderboard-stats">Balance: ${person.balance >= 0 ? '+' : ''}${person.balance}</div>
        </div>
        <div class="leaderboard-score">${person.score}</div>
      </div>
    `).join('');
  }

  static showToast(message, type = 'info', container) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}