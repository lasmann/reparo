requestAnimationFrame(() => {
  if (!customElements.get('free-shipping-bar')) {
    customElements.define(
      'free-shipping-bar',
      class FreeShippingBar extends HTMLElement {
        constructor() {
          super();
          this.completedClass = 'free-shipping-bar--completed';
          this.message = this.querySelector('.free-shipping-bar__message');
          this.progressBar = this.querySelector('.free-shipping-bar__thumb');
          this.threshold = Number(this.getAttribute('data-threshold'));
        }

        connectedCallback() {
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
          console.log(remainingToSpend);

          // Update info text and progress bar
          console.log(this.message);
          this.message.innerHTML =
            remainingToSpend > 0
              ? window.cartStrings.freeShippingHTML.replace('{{ value }}', Shopify.formatMoney(remainingToSpend))
              : window.cartStrings.freeShippingSuccessHTML;

          const progressPercentage = Math.min(totalPrice / (this.threshold / 100), 100);
          this.progressBar.style.width = `${progressPercentage}%`;

          // Toggle the completed class based on the progress
          this.classList[remainingToSpend > 0 ? 'remove' : 'add'](this.completedClass);
        }
      }
    );
  }
});
