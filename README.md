# 🧩 Snatch UI – Web Component Extractor

A powerful Chrome extension that enables developers and designers to **visually select UI components from any webpage and extract their HTML, CSS, and Tailwind classes**. Perfect for studying, learning, and remixing web interfaces.

## ✨ Features

- **🎯 Visual Component Selection** - Point and click to select any element on a webpage
- **🎨 Complete Style Extraction** - Captures all CSS including computed styles, inline styles, and external stylesheets
- **⚛️ Multiple Export Formats** - Export as HTML+CSS, React JSX, or Tailwind JSX
- **🧠 Smart Tailwind Detection** - Automatically identifies and preserves Tailwind utility classes
- **📱 Responsive Design** - Works across all screen sizes and devices
- **⚡ Performance Optimized** - Lightweight and fast with minimal page impact
- **🔧 Customizable Settings** - Adjust extraction preferences and highlight colors

## 🚀 Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mfaeezshabbir/snatch-ui.git
   cd snatch-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

### Development

```bash
# Start development build with watch mode
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🎮 Usage

1. **Click the Snatch UI extension icon** in your Chrome toolbar
2. **Click "Start Selecting"** to activate the component selector
3. **Hover over elements** on the webpage to see them highlighted
4. **Click an element** to select it
5. **Click "Extract Component"** to analyze the selected element
6. **Choose your export format** (HTML, JSX, or Tailwind JSX)
7. **Copy to clipboard or download** the extracted component

### Keyboard Shortcuts

- **↑** - Navigate to parent element
- **↓** - Navigate to child element
- **Enter** - Select highlighted element
- **Escape** - Exit selection mode

## 📁 Project Structure

```
snatch-ui/
├── src/
│   ├── background.js           # Extension service worker
│   ├── content/               # Content scripts
│   │   ├── selector.js        # DOM selection logic
│   │   ├── extractStyles.js   # Style extraction utilities
│   │   ├── export.js          # Export format generators
│   │   └── selector.css       # Selector UI styles
│   ├── popup/                 # Extension popup UI
│   │   ├── popup.html         # Popup HTML template
│   │   ├── popup.js           # Popup entry point
│   │   ├── App.jsx            # Main React component
│   │   └── popup.css          # Popup styles
│   └── utils/                 # Shared utilities
│       └── helpers.js         # Common helper functions
├── icons/                     # Extension icons
├── docs/                      # Documentation
├── manifest.json              # Extension manifest
├── package.json               # NPM dependencies
├── vite.config.js            # Vite build configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── postcss.config.js         # PostCSS configuration
```

## 🛠️ Technical Details

### Architecture

- **Manifest V3** - Built using the latest Chrome Extension API
- **React + Tailwind** - Modern UI framework with utility-first CSS
- **Vite** - Fast build tool with hot module replacement
- **Content Scripts** - Injected into web pages for DOM manipulation
- **Service Worker** - Background script for extension lifecycle management

### Style Extraction

The extension uses a sophisticated multi-layer approach to extract styles:

1. **Computed Styles** - Retrieves final rendered styles using `getComputedStyle()`
2. **Tailwind Detection** - Pattern matching against known Tailwind utility classes
3. **Custom CSS Generation** - Creates clean CSS for non-Tailwind styles
4. **Media Query Support** - Extracts responsive design rules
5. **Inline Style Processing** - Handles element-specific inline styles

### Export Formats

#### HTML + CSS
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .component { /* extracted styles */ }
  </style>
</head>
<body>
  <div class="component">Content</div>
</body>
</html>
```

#### React JSX
```jsx
import React from 'react';
import './Component.css';

const Component = () => {
  return (
    <div className="component">Content</div>
  );
};

export default Component;
```

#### Tailwind JSX
```jsx
import React from 'react';

const Component = () => {
  return (
    <div className="bg-blue-500 text-white p-4 rounded-lg">
      Content
    </div>
  );
};

export default Component;
```

## ⚙️ Configuration

### Extension Settings

Access settings by clicking the gear icon in the popup:

- **Preserve Tailwind Classes** - Keep original Tailwind utility classes
- **Include Inline Styles** - Extract element-specific inline styles
- **Highlight Color** - Customize the selection highlight color

### Tailwind Configuration

The extension includes a comprehensive set of Tailwind class patterns for detection:

- Layout (display, position, flex, grid)
- Spacing (margin, padding)
- Sizing (width, height)
- Typography (font, text)
- Colors (background, text, border)
- Effects (shadow, opacity)
- And more...

## 🔧 Development

### Adding New Export Formats

1. Create a new method in `src/content/export.js`
2. Add the format to the popup UI in `src/popup/App.jsx`
3. Update the download handler for the new format

### Extending Tailwind Detection

1. Add new patterns to `TAILWIND_PATTERNS` in `src/content/extractStyles.js`
2. Update the `isTailwindClass()` method for custom detection logic

### Custom Style Processing

1. Modify `extractRelevantStyles()` to include new CSS properties
2. Update `isDefaultValue()` to filter out unwanted default values

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tailwind CSS** - For the amazing utility-first CSS framework
- **React** - For the powerful UI library
- **Vite** - For the lightning-fast build tool
- **Chrome Extensions API** - For enabling browser extension development

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/mfaeezshabbir/snatch-ui/issues) page
2. Create a new issue with detailed information
3. Include your browser version and error messages

---

**Made with ❤️ by developers, for developers**
