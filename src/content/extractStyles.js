// Style extraction utilities for Snatch UI
// Extracts computed styles, Tailwind classes, and generates clean CSS

// Tailwind class patterns for detection
const TAILWIND_PATTERNS = {
  // Layout
  container: /^container$/,
  display: /^(block|inline-block|inline|flex|inline-flex|table|inline-table|table-cell|table-row|table-column|grid|inline-grid|hidden)$/,
  position: /^(static|fixed|absolute|relative|sticky)$/,
  
  // Flexbox & Grid
  flex: /^(flex|flex-1|flex-auto|flex-initial|flex-none)$/,
  flexDirection: /^flex-(row|row-reverse|col|col-reverse)$/,
  flexWrap: /^flex-(wrap|wrap-reverse|nowrap)$/,
  alignItems: /^items-(start|end|center|baseline|stretch)$/,
  justifyContent: /^justify-(start|end|center|between|around|evenly)$/,
  
  // Spacing
  margin: /^-?m[trblxy]?-(\d+|px|auto)$/,
  padding: /^p[trblxy]?-(\d+|px)$/,
  space: /^space-[xy]-(\d+|px|reverse)$/,
  
  // Sizing
  width: /^w-(\d+|px|auto|full|screen|min|max|fit)$/,
  height: /^h-(\d+|px|auto|full|screen|min|max|fit)$/,
  minWidth: /^min-w-(\d+|px|full|min|max|fit)$/,
  maxWidth: /^max-w-(\d+|px|full|min|max|fit|prose)$/,
  
  // Typography
  fontSize: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,
  fontWeight: /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
  textAlign: /^text-(left|center|right|justify)$/,
  textColor: /^text-(inherit|current|transparent|black|white|gray|red|yellow|green|blue|indigo|purple|pink)-(\d+)$/,
  
  // Colors
  backgroundColor: /^bg-(inherit|current|transparent|black|white|gray|red|yellow|green|blue|indigo|purple|pink)-(\d+)$/,
  borderColor: /^border-(inherit|current|transparent|black|white|gray|red|yellow|green|blue|indigo|purple|pink)-(\d+)$/,
  
  // Borders
  borderRadius: /^rounded(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?$/,
  borderWidth: /^border(-[0-8])?$/,
  
  // Effects
  boxShadow: /^shadow(-sm|-md|-lg|-xl|-2xl|-inner|-none)?$/,
  opacity: /^opacity-(\d+)$/,
  
  // Animations
  transition: /^transition(-none|-all|-colors|-opacity|-shadow|-transform)?$/,
  animation: /^animate-(none|spin|ping|pulse|bounce)$/
};

class StyleExtractor {
  constructor() {
    this.tailwindClasses = new Set();
    this.customStyles = new Map();
    this.mediaQueries = new Map();
  }
  
  async extractStyles(element) {
    const result = {
      tailwindClasses: [],
      customCSS: '',
      inlineStyles: {},
      computedStyles: {},
      stylesheets: [],
      mediaQueries: {}
    };
    
    // Extract element tree styles
    const elements = [element, ...element.querySelectorAll('*')];
    
    for (const el of elements) {
      await this.processElement(el, result);
    }
    
    // Process and clean up results
    result.tailwindClasses = Array.from(this.tailwindClasses);
    result.customCSS = this.generateCustomCSS();
    result.mediaQueries = Object.fromEntries(this.mediaQueries);
    
    return result;
  }
  
  async processElement(element, result) {
    const tagName = element.tagName.toLowerCase();
    const selector = this.generateSelector(element);
    
    // Extract classes and identify Tailwind vs custom
    const classes = element.className ? element.className.split(/\s+/).filter(Boolean) : [];
    const { tailwindClasses, customClasses } = this.categorizeClasses(classes);
    
    // Add Tailwind classes to global set
    tailwindClasses.forEach(cls => this.tailwindClasses.add(cls));
    
    // Extract computed styles for custom classes
    if (customClasses.length > 0 || element.style.cssText) {
      const computedStyle = window.getComputedStyle(element);
      const relevantStyles = this.extractRelevantStyles(computedStyle);
      
      if (Object.keys(relevantStyles).length > 0) {
        this.customStyles.set(selector, {
          styles: relevantStyles,
          customClasses,
          inlineStyles: this.parseInlineStyles(element.style.cssText)
        });
      }
    }
    
    // Extract inline styles
    if (element.style.cssText) {
      result.inlineStyles[selector] = this.parseInlineStyles(element.style.cssText);
    }
    
    // Store computed styles for reference
    const computedStyle = window.getComputedStyle(element);
    result.computedStyles[selector] = this.extractRelevantStyles(computedStyle);
  }
  
  categorizeClasses(classes) {
    const tailwindClasses = [];
    const customClasses = [];
    
    for (const className of classes) {
      if (this.isTailwindClass(className)) {
        tailwindClasses.push(className);
      } else {
        customClasses.push(className);
      }
    }
    
    return { tailwindClasses, customClasses };
  }
  
  isTailwindClass(className) {
    // Check against Tailwind patterns
    for (const pattern of Object.values(TAILWIND_PATTERNS)) {
      if (pattern.test(className)) {
        return true;
      }
    }
    
    // Additional checks for responsive prefixes and state modifiers
    const prefixedClass = className.replace(/^(sm|md|lg|xl|2xl):|^(hover|focus|active|disabled|group-hover|group-focus):/, '');
    for (const pattern of Object.values(TAILWIND_PATTERNS)) {
      if (pattern.test(prefixedClass)) {
        return true;
      }
    }
    
    return false;
  }
  
  extractRelevantStyles(computedStyle) {
    const relevantProperties = [
      // Layout
      'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
      'float', 'clear', 'overflow', 'overflow-x', 'overflow-y',
      
      // Box Model
      'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      
      // Flexbox
      'flex', 'flex-direction', 'flex-wrap', 'flex-basis', 'flex-grow', 'flex-shrink',
      'align-items', 'align-content', 'align-self', 'justify-content',
      
      // Grid
      'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
      'grid-column', 'grid-row', 'grid-area', 'gap', 'row-gap', 'column-gap',
      
      // Typography
      'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant',
      'line-height', 'letter-spacing', 'text-align', 'text-decoration',
      'text-transform', 'text-indent', 'white-space', 'word-spacing',
      
      // Colors
      'color', 'background-color', 'background-image', 'background-position',
      'background-size', 'background-repeat', 'background-attachment',
      
      // Borders
      'border', 'border-width', 'border-style', 'border-color',
      'border-top', 'border-right', 'border-bottom', 'border-left',
      'border-radius', 'border-top-left-radius', 'border-top-right-radius',
      'border-bottom-left-radius', 'border-bottom-right-radius',
      
      // Effects
      'box-shadow', 'text-shadow', 'opacity', 'visibility',
      'transform', 'transform-origin', 'perspective',
      
      // Transitions & Animations
      'transition', 'transition-property', 'transition-duration',
      'transition-timing-function', 'transition-delay',
      'animation', 'animation-name', 'animation-duration'
    ];
    
    const styles = {};
    
    for (const property of relevantProperties) {
      const value = computedStyle.getPropertyValue(property);
      if (value && value !== 'initial' && value !== 'inherit' && value !== 'unset') {
        // Skip default values
        if (!this.isDefaultValue(property, value)) {
          styles[property] = value;
        }
      }
    }
    
    return styles;
  }
  
  isDefaultValue(property, value) {
    const defaults = {
      'display': 'inline',
      'position': 'static',
      'margin': '0px',
      'padding': '0px',
      'border-width': '0px',
      'border-style': 'none',
      'background-color': 'rgba(0, 0, 0, 0)',
      'color': 'rgb(0, 0, 0)',
      'font-weight': '400',
      'text-align': 'start',
      'opacity': '1',
      'visibility': 'visible'
    };
    
    return defaults[property] === value;
  }
  
  parseInlineStyles(styleText) {
    const styles = {};
    if (!styleText) return styles;
    
    const declarations = styleText.split(';').filter(Boolean);
    for (const declaration of declarations) {
      const [property, value] = declaration.split(':').map(s => s.trim());
      if (property && value) {
        styles[property] = value;
      }
    }
    
    return styles;
  }
  
  generateSelector(element) {
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.className ? 
      element.className.split(/\s+/)
        .filter(cls => !this.isTailwindClass(cls))
        .map(cls => `.${cls}`)
        .join('') : '';
    
    let selector = tagName + id + classes;
    
    // If no unique identifier, create a data attribute
    if (!id && !classes) {
      const dataAttr = `data-snatch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      element.setAttribute(dataAttr, '');
      selector = `[${dataAttr}]`;
    }
    
    return selector;
  }
  
  generateCustomCSS() {
    let css = '';
    
    for (const [selector, data] of this.customStyles) {
      const { styles, inlineStyles } = data;
      
      // Merge styles, giving precedence to inline styles
      const mergedStyles = { ...styles, ...inlineStyles };
      
      if (Object.keys(mergedStyles).length > 0) {
        css += `${selector} {\n`;
        
        for (const [property, value] of Object.entries(mergedStyles)) {
          css += `  ${property}: ${value};\n`;
        }
        
        css += '}\n\n';
      }
    }
    
    return css.trim();
  }
  
  // Extract media queries from stylesheets
  async extractMediaQueries(element) {
    const mediaQueries = {};
    
    try {
      for (const sheet of document.styleSheets) {
        if (sheet.cssRules) {
          for (const rule of sheet.cssRules) {
            if (rule.type === CSSRule.MEDIA_RULE) {
              const mediaText = rule.media.mediaText;
              if (!mediaQueries[mediaText]) {
                mediaQueries[mediaText] = [];
              }
              
              for (const cssRule of rule.cssRules) {
                if (cssRule.type === CSSRule.STYLE_RULE) {
                  if (element.matches && element.matches(cssRule.selectorText)) {
                    mediaQueries[mediaText].push({
                      selector: cssRule.selectorText,
                      styles: cssRule.style.cssText
                    });
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      // Cross-origin stylesheets may not be accessible
      console.warn('Could not access some stylesheets:', error);
    }
    
    return mediaQueries;
  }
}

// Export function for use in content script
export async function extractStyles(element) {
  const extractor = new StyleExtractor();
  return await extractor.extractStyles(element);
}
