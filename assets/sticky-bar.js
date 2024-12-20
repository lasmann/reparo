class StickyBar extends HTMLElement {
  constructor() {
    super();
    this.ADDITIONAL_OFFSET = parseInt(this.dataset.offset, 10) || 0;

    this.target = null;
    this.header = null;
    this.footer = null;

    this.handleIntersect = this.handleIntersect.bind(this);
    this.updateStickyState = this.updateStickyState.bind(this);
    this.debouncedUpdate = this.debounce(this.updateStickyState, 50);

    this.observer = null;
  }

  connectedCallback() {
    this.initElements();
    if (!this.target || !this.header || !this.footer) return;

    this.initObserver();
    this.updateStickyState();
    window.addEventListener('scroll', this.debouncedUpdate);
    window.addEventListener('resize', this.debouncedUpdate);
  }

  disconnectedCallback() {
    if (this.observer) this.observer.disconnect();
    window.removeEventListener('scroll', this.debouncedUpdate);
    window.removeEventListener('resize', this.debouncedUpdate);
    this.removeSticky();
  }

  static get observedAttributes() {
    return ['data-offset'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-offset') {
      this.ADDITIONAL_OFFSET = parseInt(newValue, 10) || 0;
      this.updateStickyState();
    }
  }

  initElements() {
    const { target, header, footer } = this.dataset;
    this.target = document.querySelector(target);
    this.header = document.querySelector(header || '.section-header');
    this.footer = document.querySelector(footer || '.shopify-section-group-footer-group');

    if (!this.target || !this.header || !this.footer) {
      console.error(
        'StickyBar: Missing required elements (target, header, or footer). Check dataset attributes and selectors.'
      );
    }
  }

  initObserver() {
    this.observer = new IntersectionObserver(this.handleIntersect, {
      root: null,
      threshold: 0,
    });
    this.observer.observe(this.target);
  }

  handleIntersect(entries) {
    const entry = entries[0];
    if (!entry) return;

    const footerOffset = this.footer.offsetTop - this.offsetHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (!entry.isIntersecting && scrollTop + window.innerHeight < footerOffset) {
      this.setSticky();
    } else {
      this.removeSticky();
    }
  }

  updateStickyState() {
    if (!this.target || !this.footer || !this.header) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const stickyRect = this.getBoundingClientRect();
    const footerRect = this.footer.getBoundingClientRect();
    const targetRect = this.target.getBoundingClientRect();
    const headerHeight = this.header.offsetHeight;

    if (stickyRect.bottom >= footerRect.top || scrollTop < headerHeight || targetRect.bottom > 0) {
      this.removeSticky();
    } else {
      this.setSticky();
    }
  }

  setSticky() {
    if (!this.hasAttribute('is-sticky')) {
      this.setAttribute('is-sticky', '');
      document.body.classList.add('sticky-atc-visible');
    }
  }

  removeSticky() {
    if (this.hasAttribute('is-sticky')) {
      this.removeAttribute('is-sticky');
      document.body.classList.remove('sticky-atc-visible');
    }
  }

  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

if (!customElements.get('sticky-bar')) {
  customElements.define('sticky-bar', StickyBar);
}
