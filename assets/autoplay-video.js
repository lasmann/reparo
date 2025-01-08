class AutoPlayVideo extends HTMLElement {
  constructor() {
    super();
    this.video = null;
    this.videoVolume = Number(this.getAttribute('data-vid-volume'));
    this.progressBar = null;
    this.muteButton = null;
    this.playPauseButton = null;
    this.isLoaded = false;
    this.isDesktop = window.matchMedia('(min-width: 990px)'); // Correct media query
    this.allVideoEls = null; // Store reference to all video elements
  }

  connectedCallback() {
    // Initialize video, progress bar, and control buttons
    this.video = this.querySelector('video');
    this.progressBar = this.querySelector('custom-progress-bar');
    this.muteButton = this.querySelector('[video-control-type="mute"]');
    this.playPauseButton = this.querySelector('[video-control-type="play-pause"]');

    // Reference all auto-play-video elements
    this.allVideoEls = document.querySelectorAll('auto-play-video');

    // Set up event listeners and volume
    this.addEventListeners();
    this.setVolume();

    // Dynamically select the best source based on `data-src` attribute if provided
    const sources = this.querySelectorAll('source');
    if (this.dataset.src && sources.length === 0) {
      this.addDynamicSource();
    }

    // If `data-vid-preload` is set, load the video
    if (this.hasAttribute('data-vid-preload')) {
      this.loadAndPlayVideo();
    }

    // Listen for changes in the media query for desktop / mobile support
    this.isDesktop.addEventListener('change', this.handleResize.bind(this));
  }

  setVolume() {
    this.video.volume = this.videoVolume;
  }

  addEventListeners() {
    // Handle hover for desktop
    this.addEventListener('mouseenter', () => {
      if (this.isDesktop.matches) {
        this.loadAndPlayVideo();
      }
    });

    // Event listeners for video and controls
    this.video.addEventListener('timeupdate', () => this.updateProgressBar());
    this.playPauseButton.addEventListener('click', () => this.togglePlayPause());
    this.muteButton.addEventListener('click', () => this.toggleMute());
  }

  handleResize() {
    // If the window is resized and passed the desktop threshold, you may want to adjust behavior
    // Currently, `mouseenter`/`click` are being managed above
    console.log('Media query changed:', this.isDesktop.matches ? 'Desktop' : 'Mobile');
  }

  loadAndPlayVideo() {
    if (!this.isLoaded) {
      this.loadVideo();
    }
    this.togglePlayPause(); // Play the video immediately when it is loaded
  }

  loadVideo() {
    this.isLoaded = true;
    this.video.setAttribute('preload', 'auto');
    this.video.load();
  }

  togglePlayPause() {
    if (this.video.paused) {
      //   this.playPauseButton.textContent = 'Pause';
      this.setAttribute('data-vid-state', 'playing');
      this.video.play();
      this.pauseAllVideos();
    } else {
      //   this.playPauseButton.textContent = 'Play';
      this.setAttribute('data-vid-state', 'paused');
      this.video.pause();
    }
  }

  pauseAllVideos() {
    // Pause all videos except the current one
    this.allVideoEls.forEach((videoEl) => {
      if (videoEl !== this) {
        const video = videoEl.querySelector('video');
        if (video && !video.paused) {
          video.pause();
          const playPauseButton = videoEl.querySelector('[video-control-type="play-pause"]');
          if (playPauseButton) {
            videoEl.setAttribute('data-vid-state', 'paused');
          }
        }
      }
    });
  }

  toggleMute() {
    this.video.muted = !this.video.muted;
    this.setAttribute('data-vid-volume-state', this.video.muted ? 'muted' : 'unmuted');
  }

  updateProgressBar() {
    if (!this.progressBar) return;

    if (this.video.duration > 0) {
      const progress = (this.video.currentTime / this.video.duration) * 100;
      this.progressBar.setProgress(progress);
    }
  }

  // Optionally add dynamic sources if data-src is provided
  addDynamicSource() {
    const sourceElement = document.createElement('source');
    sourceElement.src = this.dataset.src;
    sourceElement.type = 'video/mp4';
    this.video.appendChild(sourceElement);
  }
}

// Define the custom element
if (!customElements.get('auto-play-video')) {
  customElements.define('auto-play-video', AutoPlayVideo);
}
