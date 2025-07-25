// Export utilities for generating different output formats
// Converts extracted HTML and styles to various formats (HTML+CSS, JSX, etc.)

import { encode } from 'html-entities';

class ComponentExporter {
  constructor() {
    this.indentSize = 2;
  }
  
  generateExports(element, html, styles) {
    return {
      html: this.generateHTMLExport(html, styles),
      jsx: this.generateJSXExport(element, styles),
      tailwindJSX: this.generateTailwindJSXExport(element, styles),
      inlineHTML: this.generateInlineHTMLExport(element),
      css: this.generateCSSExport(styles),
      copyableCode: this.generateCopyableCode(element, styles)
    };
  }
  
  generateHTMLExport(html, styles) {
    const cleanHTML = this.cleanHTML(html);
    const cssContent = styles.customCSS || '';
    
    return {
      html: this.formatHTML(cleanHTML),
      css: cssContent,
      combined: this.createHTMLDocument(cleanHTML, cssContent, styles.tailwindClasses)
    };
  }
  
  generateJSXExport(element, styles) {
    const jsx = this.convertToJSX(element);
    const cssModules = this.generateCSSModules(styles);
    
    return {
      jsx: this.formatJSX(jsx),
      css: cssModules,
      component: this.createReactComponent(jsx, cssModules)
    };
  }
  
  generateTailwindJSXExport(element, styles) {
    const jsx = this.convertToTailwindJSX(element, styles.tailwindClasses);
    
    return {
      jsx: this.formatJSX(jsx),
      component: this.createTailwindReactComponent(jsx),
      tailwindConfig: this.generateTailwindConfig(styles)
    };
  }
  
  generateInlineHTMLExport(element) {
    const clonedElement = element.cloneNode(true);
    this.inlineAllStyles(clonedElement);
    
    return {
      html: this.formatHTML(clonedElement.outerHTML),
      standalone: this.createStandaloneHTML(clonedElement)
    };
  }
  
  generateCSSExport(styles) {
    let css = '';
    
    if (styles.customCSS) {
      css += '/* Custom CSS */\n';
      css += styles.customCSS + '\n\n';
    }
    
    if (styles.tailwindClasses && styles.tailwindClasses.length > 0) {
      css += '/* Tailwind Classes Used */\n';
      css += '/*\n';
      css += styles.tailwindClasses.map(cls => `  ${cls}`).join('\n');
      css += '\n*/\n\n';
    }
    
    if (Object.keys(styles.mediaQueries).length > 0) {
      css += '/* Media Queries */\n';
      for (const [query, rules] of Object.entries(styles.mediaQueries)) {
        css += `@media ${query} {\n`;
        for (const rule of rules) {
          css += `  ${rule.selector} {\n`;
          css += `    ${rule.styles.split(';').filter(Boolean).join(';\n    ')};\n`;
          css += '  }\n';
        }
        css += '}\n\n';
      }
    }
    
    return css.trim();
  }
  
  generateCopyableCode(element, styles) {
    const formats = {
      'HTML + CSS': this.generateHTMLExport(element.outerHTML, styles).combined,
      'JSX Component': this.generateJSXExport(element, styles).component,
      'Tailwind JSX': this.generateTailwindJSXExport(element, styles).component,
      'Inline HTML': this.generateInlineHTMLExport(element).standalone
    };
    
    return formats;
  }
  
  cleanHTML(html) {
    // Remove Snatch UI specific attributes and classes
    let cleaned = html.replace(/\sdata-snatch-[^=]*="[^"]*"/g, '');
    cleaned = cleaned.replace(/\s(id|class)="[^"]*snatch-ui[^"]*"/g, '');
    
    // Remove empty attributes
    cleaned = cleaned.replace(/\s(class|style)=""\s?/g, ' ');
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }
  
  formatHTML(html) {
    // Simple HTML formatting
    let formatted = html;
    let indent = 0;
    
    formatted = formatted.replace(/></g, '>\n<');
    
    const lines = formatted.split('\n');
    const result = [];
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      if (line.startsWith('</')) {
        indent = Math.max(0, indent - this.indentSize);
      }
      
      result.push(' '.repeat(indent) + line);
      
      if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>')) {
        if (!this.isSelfClosingTag(line)) {
          indent += this.indentSize;
        }
      }
    }
    
    return result.join('\n');
  }
  
  convertToJSX(element) {
    const cloned = element.cloneNode(true);
    this.convertAttributesToJSX(cloned);
    return cloned.outerHTML;
  }
  
  convertToTailwindJSX(element, tailwindClasses) {
    const cloned = element.cloneNode(true);
    
    // Walk through all elements and preserve only Tailwind classes
    this.walkElements(cloned, (el) => {
      const classes = el.className ? el.className.split(/\s+/).filter(Boolean) : [];
      const tailwindOnly = classes.filter(cls => tailwindClasses.includes(cls));
      
      if (tailwindOnly.length > 0) {
        el.className = tailwindOnly.join(' ');
      } else {
        el.removeAttribute('class');
      }
      
      // Remove inline styles that are covered by Tailwind
      el.removeAttribute('style');
    });
    
    this.convertAttributesToJSX(cloned);
    return cloned.outerHTML;
  }
  
  convertAttributesToJSX(element) {
    this.walkElements(element, (el) => {
      // Convert class to className
      if (el.hasAttribute('class')) {
        const className = el.getAttribute('class');
        el.removeAttribute('class');
        el.setAttribute('className', className);
      }
      
      // Convert for to htmlFor
      if (el.hasAttribute('for')) {
        const htmlFor = el.getAttribute('for');
        el.removeAttribute('for');
        el.setAttribute('htmlFor', htmlFor);
      }
      
      // Convert style string to object notation
      if (el.hasAttribute('style')) {
        const style = el.getAttribute('style');
        el.removeAttribute('style');
        el.setAttribute('style', this.convertStyleToJSXObject(style));
      }
    });
  }
  
  convertStyleToJSXObject(styleString) {
    if (!styleString) return '{}';
    
    const styles = {};
    const declarations = styleString.split(';').filter(Boolean);
    
    for (const declaration of declarations) {
      const [property, value] = declaration.split(':').map(s => s.trim());
      if (property && value) {
        // Convert kebab-case to camelCase
        const camelProperty = property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
        styles[camelProperty] = value;
      }
    }
    
    return JSON.stringify(styles, null, 2);
  }
  
  inlineAllStyles(element) {
    this.walkElements(element, (el) => {
      const computedStyle = window.getComputedStyle(el);
      const inlineStyles = [];
      
      // Get all computed styles
      for (const property of computedStyle) {
        const value = computedStyle.getPropertyValue(property);
        if (value && value !== 'initial' && value !== 'inherit') {
          inlineStyles.push(`${property}: ${value}`);
        }
      }
      
      if (inlineStyles.length > 0) {
        el.setAttribute('style', inlineStyles.join('; '));
      }
      
      // Remove class attribute since styles are now inline
      el.removeAttribute('class');
    });
  }
  
  walkElements(element, callback) {
    callback(element);
    for (const child of element.children) {
      this.walkElements(child, callback);
    }
  }
  
  formatJSX(jsx) {
    // Basic JSX formatting
    return this.formatHTML(jsx)
      .replace(/className=/g, 'className=')
      .replace(/htmlFor=/g, 'htmlFor=');
  }
  
  createHTMLDocument(html, css, tailwindClasses) {
    const hasTailwind = tailwindClasses && tailwindClasses.length > 0;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Extracted Component</title>
  ${hasTailwind ? '<script src="https://cdn.tailwindcss.com"></script>' : ''}
  ${css ? `<style>
${css}
  </style>` : ''}
</head>
<body>
  ${this.formatHTML(html)}
</body>
</html>`;
  }
  
  createReactComponent(jsx, css) {
    const componentName = 'ExtractedComponent';
    
    return `import React from 'react';
${css ? `import './ExtractedComponent.css';` : ''}

const ${componentName} = () => {
  return (
    ${this.formatJSX(jsx)}
  );
};

export default ${componentName};`;
  }
  
  createTailwindReactComponent(jsx) {
    const componentName = 'ExtractedComponent';
    
    return `import React from 'react';

const ${componentName} = () => {
  return (
    ${this.formatJSX(jsx)}
  );
};

export default ${componentName};`;
  }
  
  createStandaloneHTML(element) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Extracted Component</title>
</head>
<body>
  ${this.formatHTML(element.outerHTML)}
</body>
</html>`;
  }
  
  generateCSSModules(styles) {
    if (!styles.customCSS) return '';
    
    // Convert to CSS modules format
    let css = styles.customCSS;
    
    // Replace class selectors with module syntax
    css = css.replace(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g, '.$1');
    
    return css;
  }
  
  generateTailwindConfig(styles) {
    // Basic Tailwind config with used classes
    const config = {
      content: ['./src/**/*.{js,jsx,ts,tsx}'],
      theme: {
        extend: {}
      },
      plugins: []
    };
    
    if (styles.tailwindClasses && styles.tailwindClasses.length > 0) {
      config.safelist = styles.tailwindClasses;
    }
    
    return `module.exports = ${JSON.stringify(config, null, 2)};`;
  }
  
  isSelfClosingTag(tagString) {
    const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
    const tagMatch = tagString.match(/<(\w+)/);
    return tagMatch && (selfClosingTags.includes(tagMatch[1].toLowerCase()) || tagString.endsWith('/>'));
  }
}

// Export function for use in content script
export function generateExports(element, html, styles) {
  const exporter = new ComponentExporter();
  return exporter.generateExports(element, html, styles);
}
