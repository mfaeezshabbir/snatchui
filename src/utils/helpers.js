// Shared utilities for Snatch UI extension

export const EXTENSION_ID = 'snatch-ui';

export const MESSAGE_TYPES = {
  ACTIVATE_SELECTOR: 'activateSelector',
  DEACTIVATE_SELECTOR: 'deactivateSelector',
  ELEMENT_SELECTED: 'elementSelected',
  EXTRACT_COMPONENT: 'extractComponent',
  SAVE_COMPONENT: 'saveComponent'
};

export const STORAGE_KEYS = {
  SETTINGS: 'snatchSettings',
  EXTRACTED_COMPONENTS: 'extractedComponents',
  SAVED_COMPONENTS: 'savedComponents'
};

export const DEFAULT_SETTINGS = {
  defaultExportFormat: 'html',
  preserveTailwind: true,
  includeInlineStyles: true,
  highlightColor: '#3b82f6',
  autoCleanup: true,
  maxStoredComponents: 50
};

/**
 * Debounce function to limit how often a function can fire
 */
export function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * Throttle function to limit function execution
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Generate a unique ID for components
 */
export function generateId(prefix = 'comp') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Sanitize filename for downloads
 */
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Get file extension based on export format
 */
export function getFileExtension(format) {
  const extensions = {
    html: '.html',
    jsx: '.jsx',
    tsx: '.tsx',
    css: '.css',
    json: '.json'
  };
  return extensions[format] || '.txt';
}

/**
 * Check if current page is compatible with extension
 */
export function isCompatiblePage(url) {
  if (!url) return false;
  
  const incompatibleProtocols = ['chrome:', 'chrome-extension:', 'moz-extension:', 'about:'];
  return !incompatibleProtocols.some(protocol => url.startsWith(protocol));
}

/**
 * Storage wrapper with error handling
 */
export const storage = {
  async get(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          console.error('Storage get error:', chrome.runtime.lastError);
          resolve({});
        } else {
          resolve(result);
        }
      });
    });
  },

  async set(items) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(items, () => {
        if (chrome.runtime.lastError) {
          console.error('Storage set error:', chrome.runtime.lastError);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  },

  async getLocal(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          console.error('Local storage get error:', chrome.runtime.lastError);
          resolve({});
        } else {
          resolve(result);
        }
      });
    });
  },

  async setLocal(items) {
    return new Promise((resolve) => {
      chrome.storage.local.set(items, () => {
        if (chrome.runtime.lastError) {
          console.error('Local storage set error:', chrome.runtime.lastError);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
};

/**
 * Message passing wrapper
 */
export const messaging = {
  async sendToContent(tabId, message) {
    try {
      return await chrome.tabs.sendMessage(tabId, message);
    } catch (error) {
      console.error('Failed to send message to content script:', error);
      throw error;
    }
  },

  async sendToBackground(message) {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      console.error('Failed to send message to background:', error);
      throw error;
    }
  }
};

/**
 * Download helper
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy to clipboard helper
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
}

/**
 * Validate component data
 */
export function validateComponent(component) {
  const required = ['html', 'styles', 'exports'];
  return required.every(field => component && component[field] !== undefined);
}

/**
 * Performance timing utility
 */
export class Timer {
  constructor(label) {
    this.label = label;
    this.start = performance.now();
  }

  end() {
    const duration = performance.now() - this.start;
    console.log(`${this.label}: ${duration.toFixed(2)}ms`);
    return duration;
  }
}
