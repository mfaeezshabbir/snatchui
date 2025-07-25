// Content script for DOM element selection and highlighting
// This script is injected into every webpage to enable component selection

class SnatchUISelector {
  constructor() {
    this.isActive = false;
    this.selectedElement = null;
    this.hoverElement = null;
    this.overlay = null;
    this.tooltip = null;
    this.selectionBox = null;
    
    this.boundHandlers = {
      mouseover: this.handleMouseOver.bind(this),
      mouseout: this.handleMouseOut.bind(this),
      click: this.handleClick.bind(this),
      keydown: this.handleKeyDown.bind(this),
      scroll: this.handleScroll.bind(this)
    };
    
    this.init();
  }
  
  init() {
    this.createOverlay();
    this.createTooltip();
    this.createSelectionBox();
    this.listenForMessages();
  }
  
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'snatch-ui-overlay';
    this.overlay.className = 'snatch-ui-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(1px);
      z-index: 999999;
      pointer-events: none;
      display: none;
      transition: opacity 0.2s ease;
      cursor: crosshair;
    `;
  }
  
  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.id = 'snatch-ui-tooltip';
    this.tooltip.className = 'snatch-ui-tooltip';
    this.tooltip.style.cssText = `
      position: fixed;
      background: #1f2937;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      font-weight: 500;
      z-index: 1000000;
      pointer-events: none;
      display: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      max-width: 300px;
      word-break: break-word;
    `;
  }
  
  createSelectionBox() {
    this.selectionBox = document.createElement('div');
    this.selectionBox.id = 'snatch-ui-selection-box';
    this.selectionBox.className = 'snatch-ui-selection-box';
    this.selectionBox.style.cssText = `
      position: fixed;
      border: 3px solid #3b82f6;
      background: rgba(59, 130, 246, 0.2);
      z-index: 2147483647;
      pointer-events: none;
      display: none;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.8), 0 0 20px rgba(59, 130, 246, 0.4);
      transition: all 0.1s ease;
      border-radius: 4px;
    `;
  }
  
  listenForMessages() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'ping':
          sendResponse({ success: true, ready: true });
          break;
          
        case 'activateSelector':
          this.activate();
          sendResponse({ success: true });
          break;
          
        case 'deactivateSelector':
          this.deactivate();
          sendResponse({ success: true });
          break;
          
        case 'extractSelected':
          if (this.selectedElement) {
            this.extractComponent(this.selectedElement).then(data => {
              sendResponse({ success: true, data });
            }).catch(error => {
              sendResponse({ success: false, error: error.message });
            });
          } else {
            sendResponse({ success: false, error: 'No element selected' });
          }
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action: ' + request.action });
      }
      
      return true; // Keep message channel open for async responses
    });
  }
  
  activate() {
    if (this.isActive) return;
    
    this.isActive = true;
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.tooltip);
    document.body.appendChild(this.selectionBox);
    
    this.overlay.style.display = 'block';
    
    // Add event listeners
    document.addEventListener('mouseover', this.boundHandlers.mouseover, true);
    document.addEventListener('mouseout', this.boundHandlers.mouseout, true);
    document.addEventListener('click', this.boundHandlers.click, true);
    document.addEventListener('keydown', this.boundHandlers.keydown);
    document.addEventListener('scroll', this.boundHandlers.scroll, true);
    
    // Disable page scrolling while active and set cursor
    document.body.style.overflow = 'hidden';
    document.body.style.cursor = 'crosshair';
    document.documentElement.style.cursor = 'crosshair';
    document.body.classList.add('snatch-ui-active');
    
    this.showActivationMessage();
  }
  
  deactivate() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.selectedElement = null;
    this.hoverElement = null;
    
    // Remove UI elements
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
    if (this.selectionBox && this.selectionBox.parentNode) {
      this.selectionBox.parentNode.removeChild(this.selectionBox);
    }
    
    // Remove event listeners
    document.removeEventListener('mouseover', this.boundHandlers.mouseover, true);
    document.removeEventListener('mouseout', this.boundHandlers.mouseout, true);
    document.removeEventListener('click', this.boundHandlers.click, true);
    document.removeEventListener('keydown', this.boundHandlers.keydown);
    document.removeEventListener('scroll', this.boundHandlers.scroll, true);
    
    // Restore page scrolling and cursor
    document.body.style.overflow = '';
    document.body.style.cursor = '';
    document.documentElement.style.cursor = '';
    document.body.classList.remove('snatch-ui-active');
  }
  
  handleMouseOver(event) {
    if (!this.isActive) return;
    
    event.stopPropagation();
    event.preventDefault();
    
    const element = event.target;
    if (this.isSnatchUIElement(element)) return;
    
    this.hoverElement = element;
    this.highlightElement(element);
    this.showTooltip(element, event);
  }
  
  handleMouseOut(event) {
    if (!this.isActive) return;
    
    const element = event.target;
    if (this.isSnatchUIElement(element)) return;
    
    if (this.hoverElement === element) {
      this.hideTooltip();
    }
  }
  
  handleClick(event) {
    if (!this.isActive) return;
    
    event.stopPropagation();
    event.preventDefault();
    
    const element = event.target;
    if (this.isSnatchUIElement(element)) return;
    
    this.selectedElement = element;
    this.selectElement(element);
    
    // Notify popup that element is selected
    chrome.runtime.sendMessage({
      action: 'elementSelected',
      elementInfo: this.getElementInfo(element)
    });
  }
  
  handleKeyDown(event) {
    if (!this.isActive) return;
    
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.deactivate();
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        if (this.hoverElement && this.hoverElement.parentElement) {
          this.simulateHover(this.hoverElement.parentElement);
        }
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        if (this.hoverElement && this.hoverElement.children.length > 0) {
          this.simulateHover(this.hoverElement.children[0]);
        }
        break;
        
      case 'Enter':
        event.preventDefault();
        if (this.hoverElement) {
          this.handleClick({ target: this.hoverElement, preventDefault: () => {}, stopPropagation: () => {} });
        }
        break;
    }
  }
  
  handleScroll(event) {
    if (this.selectedElement) {
      this.updateSelectionBox(this.selectedElement);
    }
  }
  
  simulateHover(element) {
    this.hoverElement = element;
    this.highlightElement(element);
    this.showTooltip(element, { clientX: 0, clientY: 0 });
  }
  
  highlightElement(element) {
    const rect = element.getBoundingClientRect();
    
    this.selectionBox.style.display = 'block';
    this.selectionBox.style.top = `${rect.top + window.scrollY}px`;
    this.selectionBox.style.left = `${rect.left + window.scrollX}px`;
    this.selectionBox.style.width = `${rect.width}px`;
    this.selectionBox.style.height = `${rect.height}px`;
    this.selectionBox.style.borderColor = '#3b82f6';
    this.selectionBox.style.background = 'rgba(59, 130, 246, 0.2)';
    this.selectionBox.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.8), 0 0 20px rgba(59, 130, 246, 0.4)';
  }
  
  selectElement(element) {
    const rect = element.getBoundingClientRect();
    
    this.selectionBox.style.borderColor = '#10b981';
    this.selectionBox.style.background = 'rgba(16, 185, 129, 0.2)';
    this.selectionBox.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.9), 0 0 30px rgba(16, 185, 129, 0.6)';
  }
  
  updateSelectionBox(element) {
    const rect = element.getBoundingClientRect();
    
    this.selectionBox.style.top = `${rect.top + window.scrollY}px`;
    this.selectionBox.style.left = `${rect.left + window.scrollX}px`;
    this.selectionBox.style.width = `${rect.width}px`;
    this.selectionBox.style.height = `${rect.height}px`;
  }
  
  showTooltip(element, event) {
    const info = this.getElementInfo(element);
    const tooltipText = `${info.tagName}${info.classes ? '.' + info.classes.join('.') : ''}${info.id ? '#' + info.id : ''}`;
    
    this.tooltip.textContent = tooltipText;
    this.tooltip.style.display = 'block';
    
    // Position tooltip
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    let left = elementRect.left;
    let top = elementRect.top - tooltipRect.height - 8;
    
    // Adjust if tooltip goes off screen
    if (top < 0) {
      top = elementRect.bottom + 8;
    }
    if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width - 8;
    }
    if (left < 0) {
      left = 8;
    }
    
    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
  }
  
  hideTooltip() {
    this.tooltip.style.display = 'none';
  }
  
  showActivationMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 1000002;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    `;
    message.innerHTML = `
      <div style="text-align: center;">
        <div style="font-weight: 600; margin-bottom: 4px;">🎯 Snatch UI Active</div>
        <div style="font-size: 12px; opacity: 0.8;">
          Hover over elements • Click to select • ↑↓ to navigate • ESC to exit
        </div>
      </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
      if (message.parentNode) {
        message.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
          if (message.parentNode) {
            message.parentNode.removeChild(message);
          }
        }, 300);
      }
    }, 4000);
  }
  
  getElementInfo(element) {
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || null,
      classes: element.className ? element.className.split(/\s+/).filter(Boolean) : [],
      attributes: Array.from(element.attributes).map(attr => ({
        name: attr.name,
        value: attr.value
      }))
    };
  }
  
  isSnatchUIElement(element) {
    return element.id && element.id.startsWith('snatch-ui-') ||
           element.className && element.className.includes('snatch-ui-');
  }
  
  async extractComponent(element) {
    try {
      // Import the extraction utilities inline
      const extractedData = await this.extractComponentData(element);
      
      const elementInfo = this.getElementInfo(element);
      const html = element.outerHTML;
      
      const result = {
        element: elementInfo,
        html,
        styles: extractedData.styles,
        exports: extractedData.exports,
        url: window.location.href,
        title: document.title
      };
      
      console.log('Extracted component data:', result);
      console.log('Exports structure:', result.exports);
      
      return result;
    } catch (error) {
      console.error('Failed to extract component:', error);
      throw error;
    }
  }
  
  async extractComponentData(element) {
    // Simplified extraction logic that doesn't require external imports
    const styles = {
      tailwindClasses: this.extractTailwindClasses(element),
      customCSS: this.extractCustomCSS(element),
      inlineStyles: this.extractInlineStyles(element),
      computedStyles: this.extractComputedStyles(element)
    };
    
    const exports = {
      html: { 
        combined: element.outerHTML + '\n\n<style>\n' + styles.customCSS + '\n</style>',
        html: element.outerHTML, 
        css: styles.customCSS 
      },
      jsx: { 
        component: this.convertToJSX(element),
        jsx: this.convertToJSX(element) 
      },
      tailwindJSX: { 
        component: this.convertToTailwindJSX(element, styles.tailwindClasses),
        jsx: this.convertToTailwindJSX(element, styles.tailwindClasses) 
      }
    };
    
    return { styles, exports };
  }
  
  extractTailwindClasses(element) {
    const allElements = [element, ...element.querySelectorAll('*')];
    const tailwindClasses = new Set();
    
    for (const el of allElements) {
      if (el.className) {
        const classes = el.className.split(/\s+/).filter(Boolean);
        classes.forEach(cls => {
          if (this.isTailwindClass(cls)) {
            tailwindClasses.add(cls);
          }
        });
      }
    }
    
    return Array.from(tailwindClasses);
  }
  
  isTailwindClass(className) {
    // Simple Tailwind class detection
    const tailwindPatterns = [
      /^(sm|md|lg|xl|2xl):/,
      /^(hover|focus|active|disabled):/,
      /^(block|inline|flex|grid|hidden)$/,
      /^(relative|absolute|fixed|sticky)$/,
      /^(w|h|m|p|space|gap)-/,
      /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|center|left|right)/,
      /^bg-(white|black|gray|red|green|blue|yellow|purple|pink|indigo)-/,
      /^border(-[0-8])?$/,
      /^rounded(-none|-sm|-md|-lg|-xl|-full)?$/,
      /^shadow(-sm|-md|-lg|-xl|-2xl|-none)?$/,
      /^font-(thin|light|normal|medium|semibold|bold|black)/,
      /^flex-(1|auto|initial|none|row|col|wrap)/,
      /^items-(start|center|end|stretch|baseline)$/,
      /^justify-(start|center|end|between|around|evenly)$/
    ];
    
    return tailwindPatterns.some(pattern => pattern.test(className));
  }
  
  extractCustomCSS(element) {
    const allElements = [element, ...element.querySelectorAll('*')];
    let css = '';
    
    for (const el of allElements) {
      const computed = window.getComputedStyle(el);
      const selector = this.generateCSSSelector(el);
      
      if (el.className) {
        const customClasses = el.className.split(/\s+/)
          .filter(cls => cls && !this.isTailwindClass(cls));
        
        if (customClasses.length > 0) {
          css += `${selector} {\n`;
          // Add relevant computed styles
          const relevantProps = [
            'display', 'position', 'width', 'height', 'margin', 'padding',
            'color', 'background-color', 'border', 'font-size', 'font-weight'
          ];
          
          relevantProps.forEach(prop => {
            const value = computed.getPropertyValue(prop);
            if (value && value !== 'auto' && value !== '0px') {
              css += `  ${prop}: ${value};\n`;
            }
          });
          css += '}\n\n';
        }
      }
    }
    
    return css;
  }
  
  extractInlineStyles(element) {
    const styles = {};
    if (element.style.cssText) {
      const declarations = element.style.cssText.split(';').filter(Boolean);
      declarations.forEach(declaration => {
        const [property, value] = declaration.split(':').map(s => s.trim());
        if (property && value) {
          styles[property] = value;
        }
      });
    }
    return styles;
  }
  
  extractComputedStyles(element) {
    const computed = window.getComputedStyle(element);
    const styles = {};
    const relevantProps = [
      'display', 'position', 'width', 'height', 'margin', 'padding',
      'color', 'background-color', 'border', 'font-size', 'font-weight',
      'text-align', 'border-radius', 'box-shadow', 'opacity'
    ];
    
    relevantProps.forEach(prop => {
      const value = computed.getPropertyValue(prop);
      if (value) {
        styles[prop] = value;
      }
    });
    
    return styles;
  }
  
  generateCSSSelector(element) {
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.className ? 
      element.className.split(/\s+/)
        .filter(cls => !this.isTailwindClass(cls))
        .map(cls => `.${cls}`)
        .join('') : '';
    
    return tagName + id + classes || tagName;
  }
  
  convertToJSX(element) {
    let jsx = element.outerHTML;
    jsx = jsx.replace(/class=/g, 'className=');
    jsx = jsx.replace(/for=/g, 'htmlFor=');
    
    // Wrap in a React component
    const componentName = 'ExtractedComponent';
    const componentJSX = `import React from 'react';

const ${componentName} = () => {
  return (
    ${jsx}
  );
};

export default ${componentName};`;
    
    return componentJSX;
  }
  
  convertToTailwindJSX(element, tailwindClasses) {
    const clone = element.cloneNode(true);
    this.walkElements(clone, (el) => {
      if (el.className) {
        const classes = el.className.split(/\s+/).filter(Boolean);
        const tailwindOnly = classes.filter(cls => tailwindClasses.includes(cls));
        el.className = tailwindOnly.join(' ');
      }
      el.removeAttribute('style');
    });

    let jsx = clone.outerHTML;
    jsx = jsx.replace(/class=/g, 'className=');
    jsx = jsx.replace(/for=/g, 'htmlFor=');
    
    // Wrap in a React component with Tailwind classes
    const componentName = 'TailwindComponent';
    const componentJSX = `import React from 'react';

const ${componentName} = () => {
  return (
    ${jsx}
  );
};

export default ${componentName};`;
    
    return componentJSX;
  }  walkElements(element, callback) {
    callback(element);
    for (const child of element.children) {
      this.walkElements(child, callback);
    }
  }
}

// Initialize the selector when script loads
if (!window.snatchUISelector) {
  console.log('Initializing Snatch UI selector...');
  window.snatchUISelector = new SnatchUISelector();
  console.log('Snatch UI selector initialized successfully');
} else {
  console.log('Snatch UI selector already exists');
}

// Add CSS animations and styles
const style = document.createElement('style');
style.textContent = `
  .snatch-ui-active * {
    cursor: crosshair !important;
  }
  
  .snatch-ui-selection-box {
    border-radius: 4px !important;
    border-width: 3px !important;
    border-style: solid !important;
  }
  
  @keyframes slideIn {
    from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
  }
  
  @keyframes snatch-ui-pulse {
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
  }
`;
document.head.appendChild(style);
