// Define MarqueeSlider if it's not already defined
if (!customElements.get('marquee-slider')) {
  class MarqueeSlider extends HTMLElement {
    constructor() {
      super();

      // Watch for changes in the element's size
      if (window.ResizeObserver) {
        new ResizeObserver((entries) => this.updateDuration(entries)).observe(this);
      }
    }

    updateDuration(entries) {
      const scrollSpeed = parseInt(this.getAttribute('speed') || 5);
      const containerWidth = entries[0].contentRect.width;
      const speedAdjustment = 1 + (Math.min(1600, containerWidth) - 375) / (1600 - 375);

      const marqueeTextWidth = entries[0].target.querySelector('.marquee-slider__container').clientWidth;
      const animationDuration = ((scrollSpeed * speedAdjustment * marqueeTextWidth) / containerWidth).toFixed(3);

      this.style.setProperty('--marquee-animation-duration', `${animationDuration}s`);
    }
  }

  window.customElements.define('marquee-slider', MarqueeSlider);
}
