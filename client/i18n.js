// i18n.js - Internationalization module for Tugwemo
class I18n {
  constructor() {
    this.currentLanguage = this.getStoredLanguage() || 'en';
    this.translations = {};
    this.isLoaded = false;
  }

  // Get stored language from localStorage or cookies
  getStoredLanguage() {
    // Try localStorage first
    let lang = localStorage.getItem('language');

    // Fallback to cookies
    if (!lang) {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'language') {
          lang = value;
          break;
        }
      }
    }

    return lang;
  }

  // Store language in localStorage and cookies
  setStoredLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);

    // Also store in cookies as fallback
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year expiry
    document.cookie = `language=${lang}; expires=${expiryDate.toUTCString()}; path=/`;

    // Reload translations if already loaded
    if (this.isLoaded) {
      this.loadTranslations(lang).then(() => {
        this.applyTranslations();
      });
    }
  }

  // Load translations for a specific language
  async loadTranslations(lang = this.currentLanguage) {
    try {
      const response = await fetch(`./locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}`);
      }
      this.translations = await response.json();
      this.currentLanguage = lang;
      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to English if loading fails
      if (lang !== 'en') {
        await this.loadTranslations('en');
      }
    }
  }

  // Get translated text by key path (e.g., 'nav.home', 'auth.welcomeBack')
  get(key, fallback = '') {
    if (!this.isLoaded) {
      return fallback;
    }

    const keys = key.split('.');
    let value = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return fallback || key;
      }
    }

    return typeof value === 'string' ? value : fallback || key;
  }

  // Apply translations to elements with data-i18n attribute
  applyTranslations() {
    if (!this.isLoaded) return;

    // Update elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.get(key);

      if (translation) {
        // Handle different element types
        if (element.tagName === 'INPUT' && element.type === 'placeholder') {
          element.placeholder = translation;
        } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          // For input values, only set if empty or specifically marked
          if (element.hasAttribute('data-i18n-value') || element.value === '') {
            element.value = translation;
          }
        } else {
          element.textContent = translation;
        }
      }
    });

    // Update elements with data-i18n-title attribute
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.get(key);
      if (translation) {
        element.title = translation;
      }
    });

    // Update elements with data-i18n-placeholder attribute
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.get(key);
      if (translation) {
        element.placeholder = translation;
      }
    });
  }

  // Initialize i18n system
  async init() {
    await this.loadTranslations();
    this.applyTranslations();

    // Set up language switcher if it exists
    this.setupLanguageSwitcher();
  }

  // Set up language switcher functionality
  setupLanguageSwitcher() {
    const switcher = document.getElementById('language-switcher');
    if (switcher) {
      switcher.addEventListener('change', (e) => {
        this.setStoredLanguage(e.target.value);
      });
    }
  }

  // Change language
  async changeLanguage(lang) {
    await this.setStoredLanguage(lang);
    // Page will reload to apply new language
    window.location.reload();
  }

  // Get available languages
  getAvailableLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'rw', name: 'Kinyarwanda' },
      { code: 'fr', name: 'Français' }
    ];
  }

  // Get current language info
  getCurrentLanguage() {
    const languages = this.getAvailableLanguages();
    return languages.find(lang => lang.code === this.currentLanguage) || languages[0];
  }
}

// Create global i18n instance
const i18n = new I18n();

// Make it globally available
window.i18n = i18n;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
  i18n.init();
}
