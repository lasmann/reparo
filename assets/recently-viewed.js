if (!customElements.get('recently-viewed')) {
  class RecentlyViewed extends HTMLElement {
    constructor() {
      super();
      this.fetchAttempts = 0;
      this.updateRecentlyViewed(this.dataset.exclude);
      this.init();
    }

    async init() {
      try {
        const query = this.buildSearchQuery();
        const url = `${this.dataset.url}&q=${query}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText} (${response.status})`);
        }

        const template = document.createElement('template');
        template.innerHTML = await response.text();

        const content = template.content.querySelector('recently-viewed');
        if (content?.hasChildNodes()) {
          this.innerHTML = content.innerHTML;

          // Initialize Swiper only if swiper-slider is found in the content
          const slider = this.querySelector('swiper-slider');
          if (slider) {
            console.log('Swiper slider found, initializing...');
            slider.initializeSwiper(); // Make sure this method is available in the swiper-slider component
          }
        }
      } catch (error) {
        console.error('Error fetching or parsing data:', error);
        this.handleFetchError(error);
      }
    }

    buildSearchQuery() {
      const storedItems = localStorage.getItem('recently-viewed-items');
      const items = storedItems ? JSON.parse(storedItems) : [];

      if (this.dataset.exclude) {
        const excludedId = Number(this.dataset.exclude);
        const excludeIndex = items.indexOf(excludedId);
        if (excludeIndex !== -1) {
          items.splice(excludeIndex, 1);
        }
      }

      const limit = Number(this.dataset.limit) || items.length;
      return items
        .slice(0, limit)
        .map((item) => `id:${item}`)
        .join(' OR ');
    }

    handleFetchError(error) {
      this.fetchAttempts += 1;

      if (this.fetchAttempts < 3) {
        console.warn(`Retrying fetch... Attempt ${this.fetchAttempts}`);
        this.init();
      } else {
        console.error('Max fetch attempts reached:', error);
      }
    }

    updateRecentlyViewed(productId) {
      try {
        const items = JSON.parse(localStorage.getItem('recently-viewed-items') || '[]');

        if (!items.includes(productId)) {
          items.unshift(productId);
        }

        localStorage.setItem('recently-viewed-items', JSON.stringify(items.slice(0, 12)));
      } catch (e) {
        console.error('Error updating recently viewed:', e);
      }
    }
  }

  customElements.define('recently-viewed', RecentlyViewed);
}
