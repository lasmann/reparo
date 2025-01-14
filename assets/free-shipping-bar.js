class CustomProgressBar extends HTMLElement {
  constructor() {
    super();
    this.progressBarThumb = this.querySelector('[progress-bar-thumb]');
  }

  connectedCallback() {
    if (!this.progressBarThumb) {
      this.progressBarThumb = document.createElement('div');
      this.progressBarThumb.setAttribute('[progress-bar-thumb]', '');
      this.appendChild(this.progressBarThumb);
    }
  }

  // Method to set the progress of the bar (0 - 100)
  setProgress(percentage) {
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    this.progressBarThumb.style.width = `${clampedPercentage}%`;
  }
}

customElements.define('custom-progress-bar', CustomProgressBar);

requestAnimationFrame(() => {
  if (!customElements.get('free-shipping-bar')) {
    customElements.define(
      'free-shipping-bar',
      class FreeShippingBar extends CustomProgressBar {
        constructor() {
          super();
          this.completedClass = 'custom-progress-bar--completed';
          this.message = this.querySelector('[progress-bar-message]');
          this.threshold = Number(this.getAttribute('data-threshold'));
        }

        connectedCallback() {
          super.connectedCallback(); // Call the base class method
          this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, this.update.bind(this));
          this.quantityUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.quantityUpdate, this.update.bind(this));
        }

        disconnectedCallback() {
          if (this.cartUpdateUnsubscriber) {
            this.cartUpdateUnsubscriber();
          }
          if (this.quantityUpdateUnsubscriber) {
            this.quantityUpdateUnsubscriber();
          }
        }

        update() {
          this.getCartData().then((cart) => {
            this.updateState(cart.total_price);
          });
        }

        getCartData() {
          return fetch(`${routes.cart_url}`, { ...fetchConfig() })
            .then((response) => response.text())
            .then((state) => JSON.parse(state))
            .catch((error) => console.error(error));
        }

        updateState(totalPrice) {
          const remainingToSpend = Math.max(this.threshold - totalPrice, 0);

          // Update info text and progress bar
          this.message.innerHTML =
            remainingToSpend > 0
              ? window.cartStrings.freeShippingHTML.replace('{{ value }}', Shopify.formatMoney(remainingToSpend))
              : window.cartStrings.freeShippingSuccessHTML;

          const progressPercentage = Math.min(totalPrice / (this.threshold / 100), 100);
          // Use the inherited setProgress method
          this.setProgress(progressPercentage);

          // Toggle the completed class based on the progress
          this.classList[remainingToSpend > 0 ? 'remove' : 'add'](this.completedClass);
        }
      }
    );
  }
});
