class TikTokCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }); // Shadow DOM
    this.tiktokUrl = this.getAttribute('data-src');
    this.errorText = this.getAttribute('data-error-text') || 'Error loading video.';
    this.renderLoading();
  }

  connectedCallback() {
    // Check if URL is provided
    if (!this.tiktokUrl) {
      this.renderError('No TikTok URL provided.');
      return;
    }

    // Fetch oEmbed data and render content
    this.fetchOEmbedData(this.tiktokUrl)
      .then((data) => this.renderContent(data))
      .catch((err) => this.renderError(err.message));
  }

  fetchOEmbedData(url) {
    const oEmbedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    return fetch(oEmbedUrl).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch TikTok video data.');
      }
      return response.json();
    });
  }

  renderLoading() {
    this.setAttribute('type', 'loading');
    this.shadowRoot.innerHTML = `
        <div class="loading-spinner">Loading TikTok video...</div>
      `;
  }

  renderContent(data) {
    this.setAttribute('type', 'loaded');
    this.shadowRoot.innerHTML = `
        <style>
          iframe {
            display: block;
            width: 100%;
            height: 500px;
            border: none;
          }
        </style>
        <div>
          ${data.html} <!-- Embed TikTok's oEmbed iframe HTML -->
        </div>
      `;
  }

  renderError(message) {
    this.setAttribute('type', 'error');
    this.shadowRoot.innerHTML = `
        <div class="error">${this.errorText}</div>
      `;
    console.error(message);
  }
}

// Define the custom element
if (!customElements.get('tiktok-card')) {
  customElements.define('tiktok-card', TikTokCard);
}
