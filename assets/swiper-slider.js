class SwiperSlider extends HTMLElement {
  constructor() {
    super();
    this.slideContainer = this.querySelector('[data-swiper]:not([data-swiper-thumbs])');
    this.slides = this.querySelectorAll('[data-swiper-slide]');
    this.sliderOptions = this.parseOptions(this.dataset.options);
    this.activeIndex = 0;
    this.initialized = false;
    this.thumbnails = this.querySelector('[data-swiper-thumbs]');

    if (!this.hasAttribute('disable-auto-init')) {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    if (this.slideContainer && this.slides.length > 0) {
      document.addEventListener('DOMContentLoaded', () => this.initializeSwiper());
      document.addEventListener('shopify:section:load', () => this.initializeSwiper());
      window.addEventListener(
        'resize',
        this.debouncedResize(() => this.updateSliderSize(), 300)
      );
    } else {
      console.warn('SwiperSlider - Slider or Slides Not Found');
    }
  }

  parseOptions(options) {
    try {
      if (options) {
        const sanitizedOptions = options.replace(/'/g, '"');
        return JSON.parse(sanitizedOptions || '{}');
      }
      return {};
    } catch (error) {
      console.error('Error parsing options: ', error);
      return {};
    }
  }

  initializeSwiper() {
    if (window.Swiper && !this.initialized) {
      this.initialized = true;
      this.setThumbnails();
      this.slider = new Swiper(this.slideContainer, this.sliderOptions);
      this.handleAutoplay();
    } else if (!window.Swiper) {
      console.warn('SwiperSlider - Swiper.js not found');
    }
  }

  updateSliderSize() {
    this.slider?.updateSize();
  }

  handleAutoplay() {
    if (this.hasAttribute('swiper-mouse-sensitive')) {
      this.addEventListener('mouseenter', () => this.slider?.autoplay?.stop());
      this.addEventListener('mouseleave', () => this.slider?.autoplay?.start());
    }

    const mediaQuery = this.getAttribute('autoplay-disable-media');
    if (mediaQuery) {
      const mediaQueryList = window.matchMedia(`(max-width: ${mediaQuery})`);
      if (mediaQueryList.matches) {
        this.slider?.autoplay?.stop();
        Object.assign(this.slider.params, {
          autoplay: { disableOnInteraction: true },
          freeMode: { enabled: false },
          speed: 400,
        });
      }
    }
  }

  setThumbnails() {
    if (this.thumbnails) {
      const thumbOptions = this.parseOptions(this.thumbnails.dataset.swiperOptions);
      const thumbnailsSlider = new Swiper(this.thumbnails, thumbOptions);
      this.sliderOptions.thumbs = { swiper: thumbnailsSlider };
    }
  }

  debouncedResize(callback, delay) {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(callback, delay);
    };
  }
}

class ResponsiveSwiperSlider extends SwiperSlider {
  constructor() {
    super();
    this.maxWidth = this.dataset.maxWidth || '768px';
    this.sliderInitialized = false;
    this.initOrDestroySlider();
    this.setupResizeWatcher();
  }

  initOrDestroySlider() {
    const shouldInitialize = window.matchMedia(`(max-width: ${this.maxWidth})`).matches;
    if (shouldInitialize && !this.sliderInitialized) {
      super.initializeSwiper();
      this.sliderInitialized = true;
      this.setAttribute('initialized', '');
    } else if (!shouldInitialize && this.sliderInitialized) {
      this.destroySlider();
    }
  }

  destroySlider() {
    if (this.sliderInitialized) {
      this.slider?.destroy(true, true);
      this.sliderInitialized = false;
      this.removeAttribute('initialized');
    }
  }

  setupResizeWatcher() {
    window.addEventListener(
      'resize',
      this.debouncedResize(() => this.initOrDestroySlider(), 300)
    );
  }

  initializeSwiper() {
    // Override to only initialize based on media query
    const shouldInitialize = window.matchMedia(`(max-width: ${this.maxWidth})`).matches;
    if (shouldInitialize) {
      super.initializeSwiper();
    }
  }

  updateSliderSize() {}
}

// Register custom elements
customElements.define('swiper-slider', SwiperSlider);
customElements.define('responsive-swiper-slider', ResponsiveSwiperSlider);
