class SiteCountdown extends HTMLElement {
  constructor() {
    super();
    this.targetDate = new Date(this.getAttribute('data-target-date'));
    if (isNaN(this.targetDate)) {
      console.error('Invalid date format. Please use YYYY-MM-DD.');
      return;
    }
    this.isVisible = false;
    this.lastTimeUnits = null;
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
      threshold: 0.1,
    });
  }

  connectedCallback() {
    this.startCountdown();
    this.observer.observe(this);
  }

  startCountdown() {
    this.updateCountdown();
    this.interval = setInterval(() => {
      if (this.isVisible) {
        this.updateCountdown();
      }
    }, 1000);
  }

  updateCountdown() {
    const now = new Date();
    const timeRemaining = this.targetDate - now;

    if (timeRemaining <= 0) {
      clearInterval(this.interval);
      this.innerHTML = 'Countdown complete!';
      return;
    }

    const timeUnits = {
      days: Math.floor(timeRemaining / (1000 * 60 * 60 * 24)),
      hours: Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((timeRemaining % (1000 * 60)) / 1000),
    };

    // Update DOM only for changed values
    if (!this.lastTimeUnits) {
      this.lastTimeUnits = { ...timeUnits };
    }

    this.querySelectorAll('[data-type]').forEach((dataCell) => {
      const cellType = dataCell.getAttribute('data-type');
      if (timeUnits[cellType] !== this.lastTimeUnits[cellType]) {
        dataCell.innerHTML = timeUnits[cellType];
      }
    });

    this.lastTimeUnits = { ...timeUnits };
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      this.isVisible = entry.isIntersecting;
      if (this.isVisible) {
        this.startCountdown();
      } else {
        clearInterval(this.interval);
      }
    });
  }

  disconnectedCallback() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.observer.disconnect();
  }
}

customElements.define('site-countdown', SiteCountdown);
