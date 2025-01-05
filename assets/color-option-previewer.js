class ColorOptionPreviewer extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    const swatches = this.querySelectorAll('.js-swatch-button');
    swatches.forEach((swatch) => {
      swatch.addEventListener('click', (event) => this.handleSwatchClick(event, swatch, swatches));
    });
  }

  handleSwatchClick(event, swatch, swatches) {
    const baseSrcPrimary = swatch.dataset.primarySrc;
    const baseSrcSecondary = swatch.dataset.secondarySrc;
    const targetUrl = swatch.dataset.targetUrl;

    const productItem = swatch.closest('.product-card-wrapper');
    const productItemLinks = productItem.querySelectorAll('a');
    if (!productItem) return;

    const primaryImage = productItem.querySelector('.card__primary-picture');
    const secondaryImage = productItem.querySelector('.card__secondary-picture');

    swatches.forEach((item) => item.classList.remove('color-swatch--selected'));
    swatch.classList.add('color-swatch--selected');

    if (primaryImage) {
      this.updateImageWithTransition(
        primaryImage,
        this.getImageSrc(baseSrcPrimary),
        this.getImageSrcSet(baseSrcPrimary)
      );
    }

    if (secondaryImage) {
      this.updateImageWithTransition(
        secondaryImage,
        this.getImageSrc(baseSrcSecondary),
        this.getImageSrcSet(baseSrcSecondary)
      );
    }

    productItemLinks.forEach((link) => {
      if (targetUrl) {
        link.href = targetUrl;
      }
    });
  }

  updateImageWithTransition(imageElement, newSrc, newSrcSet) {
    imageElement.style.transition = 'opacity 0.35s ease-in-out';
    imageElement.style.opacity = '0';

    const onTransitionEnd = () => {
      imageElement.src = newSrc;
      imageElement.srcset = newSrcSet;
      imageElement.style.opacity = '1';
      imageElement.removeEventListener('transitionend', onTransitionEnd);
    };

    imageElement.addEventListener('transitionend', onTransitionEnd);
  }

  getImageSrc(baseSrc) {
    return `${baseSrc}&width=1386 1386w`;
  }

  getImageSrcSet(baseSrc) {
    return Array.from({ length: 12 }, (_, i) => {
      const size = (i + 2) * 100;
      return `${baseSrc}&width=${size} ${size}w`;
    }).join(', ');
  }
}

customElements.define('color-option-previewer', ColorOptionPreviewer);
