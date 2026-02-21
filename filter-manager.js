export class FilterManager {
  constructor() {
    this.filters = {
      status: 'all',
      person: '',
      search: ''
    };
  }

  setStatusFilter(status) {
    this.filters.status = status;
  }

  setPersonFilter(person) {
    this.filters.person = person;
  }

  setSearchFilter(search) {
    this.filters.search = search.toLowerCase();
  }

  getFilters() {
    return this.filters;
  }

  applyFilters(favors) {
    return favors.filter(favor => {
      if (this.filters.status !== 'all' && favor.status !== this.filters.status) {
        return false;
      }

      if (this.filters.person && favor.person !== this.filters.person) {
        return false;
      }

      if (this.filters.search) {
        const searchLower = this.filters.search;
        return (
          favor.title.toLowerCase().includes(searchLower) ||
          favor.person.toLowerCase().includes(searchLower) ||
          (favor.description && favor.description.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }

  getPeople(favors) {
    const peopleMap = new Map();
    const filteredFavors = this.applyFilters(favors);

    filteredFavors.forEach(favor => {
      if (!peopleMap.has(favor.person)) {
        peopleMap.set(favor.person, { oweValue: 0, owedValue: 0, total: 0 });
      }
      const stats = peopleMap.get(favor.person);
      if (favor.status === 'pending') {
        const value = favor.value || 1;
        if (favor.direction === 'owe') {
          stats.oweValue += value;
        } else {
          stats.owedValue += value;
        }
      }
      stats.total++;
    });

    return Array.from(peopleMap.entries()).map(([name, stats]) => ({
      name,
      ...stats,
      balance: stats.owedValue - stats.oweValue
    })).sort((a, b) => b.balance - a.balance);
  }
}