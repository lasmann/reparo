class MegaMenu extends HTMLElement {
  constructor() {
    super();
    this.activeLink = null;
    this.activeMenu = null;
    this.menuInner = this.querySelector('.mega-menu__inner');
    this.header = document.querySelector('.section-header');
    this.links = Array.from(this.header.querySelectorAll('.header__menu-item'));
    this.menuContainers = Array.from(document.querySelectorAll('.mega-menu-container'));

    // Bind methods
    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.handleKeyboardNavigation = this.handleKeyboardNavigation.bind(this);
    this.handleLinkActivation = this.handleLinkActivation.bind(this);
    this.checkScreenSize = this.checkScreenSize.bind(this);
    this.setTargetLinksAsMegaLinks = this.setTargetLinksAsMegaLinks.bind(this);

    this.megaMenuLinks = []; // Will be populated in connectedCallback
    this.focusFirstElementAfterOpen = false; // New state to control focus behavior
  }

  connectedCallback() {
    this.setTargetLinksAsMegaLinks();
    this.megaMenuLinks = Array.from(this.header.querySelectorAll('.mega-menu-link'));

    this.setupEventListeners();
    this.makeMenusAccessible();

    if (Shopify.designMode) {
      this.setupAdminListeners();
    }

    this.checkScreenSize();

    // Optional: Re-check screen size on resize
    window.addEventListener('resize', this.checkScreenSize);
  }

  handleKeyboardNavigation(e) {
    const isTabPressed = e.key === 'Tab';
    const isEscapePressed = e.key === 'Escape';

    if (isEscapePressed && this.activeMenu) {
      this.closeMenu();
      if (this.activeLink) this.activeLink.focus();
    }

    if (isTabPressed && this.activeMenu) {
      const focusableElements = this.activeMenu.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        this.closeMenu();
        this.focusNextLink();
      }
    }
  }

  checkScreenSize() {
    const isDesktop = window.innerWidth >= 990; // Change 750 to your preferred desktop breakpoint
    if (isDesktop) {
      this.renderTemplateContent();
    } else {
      this.removeTemplateContent();
    }
  }

  renderTemplateContent() {
    const template = document.querySelector(`#megaMenuTemplate-${this.id}`);
    if (template && !this.querySelector('.mega-menu__content')) {
      const content = template.content.cloneNode(true);
      this.appendChild(content); // Append the content of the template into the mega-menu
    }
  }

  removeTemplateContent() {
    const content = this.querySelector('.mega-menu__content');
    if (content) {
      content.remove();
    }
  }

  setupEventListeners() {
    this.megaMenuLinks.forEach((link) => {
      link.addEventListener('mouseenter', () => {
        if (!link.matches(':focus-within')) {
          this.openMenu(link.dataset.menu);
        }
      });

      link.addEventListener('keydown', this.handleLinkActivation);
    });

    this.links.forEach((link) => {
      link.addEventListener('mouseenter', () => {
        if (link !== this.activeLink) {
          this.closeMenu();
        }
      });
    });

    if (!Shopify.designMode) {
      this.addEventListener('mouseleave', this.closeMenu);
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.mega-menu__inner')) {
        this.closeMenu();
      }
    });

    document.addEventListener('keydown', this.handleKeyboardNavigation);
  }

  menuisOpen(menu) {
    return menu.getAttribute('aria-hidden') === 'true' ? false : true;
  }

  setupAdminListeners() {
    this.renderTemplateContent();
    document.addEventListener('shopify:block:select', (e) => {
      const targetSection = e.target.closest('.shopify-section');
      const targetMegaMenu = targetSection?.querySelector('mega-menu');

      if (targetMegaMenu && !this.menuisOpen(targetMegaMenu)) {
        this.openMenu(targetMegaMenu.id);
      }
    });

    document.addEventListener('shopify:section:select', (e) => {
      const targetMegaMenu = e.target.querySelector('mega-menu');
      if (targetMegaMenu) this.openMenu(targetMegaMenu.id);
    });

    document.addEventListener('shopify:section:deselect', this.closeMenu);
  }

  openMenu(targetId) {
    if (!targetId) return;
    const menu = document.getElementById(targetId);
    const link = this.header.querySelector(`[data-menu="${targetId}"]`);

    if (menu && link) {
      if (this.activeMenu && this.activeMenu !== menu) {
        this.closeMenu();
      }

      this.activeMenu = menu;
      this.activeLink = link;

      this.activeLink.setAttribute('aria-expanded', 'true');
      this.activeMenu.setAttribute('aria-hidden', 'false');

      this.activeMenu.setAttribute('tabindex', '0');

      // Track that we want to focus the first element when the menu is opened
      this.focusFirstElementAfterOpen = true;
    }
  }

  trapFocusWithinMenu() {
    const focusableElements = Array.from(
      this.activeMenu.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])')
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabNavigation = (e) => {
      const isTabPressed = e.key === 'Tab';

      if (isTabPressed) {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          this.closeMenu();
          this.focusNextLink();
        }
      }
    };

    this.activeMenu.addEventListener('keydown', handleTabNavigation);
  }

  focusNextLink() {
    const linkIndex = this.links.indexOf(this.activeLink);
    const nextLink = this.links[linkIndex + 1] || this.links[0];

    if (nextLink) {
      nextLink.focus();
    }
  }

  handleLinkActivation(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const menuId = event.target.dataset.menu;
      if (menuId) {
        this.openMenu(menuId);

        // If the focusFirstElementAfterOpen flag is set, focus the first element inside the mega-menu
        if (this.focusFirstElementAfterOpen) {
          const firstFocusableElement = this.activeMenu.querySelector(
            'a, button, input, [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusableElement) {
            setTimeout(() => {
              firstFocusableElement.focus();
              this.focusFirstElementAfterOpen = false; // Reset flag
            }, 0);
          }
        }
      }
    }
  }

  closeMenu() {
    if (this.activeMenu) {
      if (this.activeLink) {
        this.activeLink.setAttribute('aria-expanded', 'false');
      }
      this.activeMenu.setAttribute('aria-hidden', 'true');
      this.activeMenu.setAttribute('tabindex', '-1');
      this.activeMenu.removeEventListener('keydown', this.handleTabNavigation);
      this.activeMenu = null;
      this.activeLink = null;
    }
  }

  setTargetLinksAsMegaLinks() {
    this.links.forEach((link) => {
      if (link.dataset.menu === this.id) {
        link.classList.add('mega-menu-link');
        link.setAttribute('role', 'button');
        link.setAttribute('aria-expanded', 'false');
        link.setAttribute('aria-haspopup', 'true');
      }
    });
  }

  makeMenusAccessible() {
    this.menuContainers.forEach((menu) => {
      menu.setAttribute('tabindex', '-1');
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-hidden', 'true');
    });
  }
}

if (!customElements.get('mega-menu')) {
  customElements.define('mega-menu', MegaMenu);
}
