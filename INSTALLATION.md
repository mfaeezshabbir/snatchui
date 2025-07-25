# 🚀 Snatch UI Extension - Installation Guide

Your Snatch UI Chrome extension has been successfully created and **FIXED**! The extension is now ready to load without errors.

## ✅ What Was Fixed

The extension had build configuration issues that have been resolved:
- ✅ Content scripts are now properly copied as standalone files (not bundled)
- ✅ CSS files are correctly included in the manifest
- ✅ All file paths in manifest.json are correct
- ✅ No more "Could not load CSS" or manifest errors

## 📦 Installation

### 1. Build the Extension (Complete!)
The extension has been built and is ready in the `dist/` folder with all fixes applied.

### 2. Load in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project
5. The Snatch UI extension should appear in your extensions list ✅

### 3. Pin the Extension
1. Click the extensions icon (puzzle piece) in Chrome toolbar
2. Find "Snatch UI" and click the pin icon to keep it visible

## 🎮 How to Use

### Basic Usage
1. **Navigate to any webpage** you want to extract components from
2. **Click the Snatch UI icon** in your Chrome toolbar
3. **Click "Start Selecting"** - this activates the component selector
4. **Hover over elements** on the page to see them highlighted with a blue border
5. **Click an element** to select it (border turns green)
6. **Click "Extract Component"** to analyze the selected element
7. **Choose your export format** and copy or download the result

### Keyboard Shortcuts (while selecting)
- **↑ Arrow** - Navigate to parent element
- **↓ Arrow** - Navigate to child element  
- **Enter** - Select the highlighted element
- **Escape** - Exit selection mode

### Export Formats
- **HTML + CSS** - Complete HTML with embedded or external CSS
- **React JSX** - React component with separate CSS file
- **Tailwind JSX** - React component using only Tailwind classes

## 🛠️ Development

### Development Mode
To make changes and test:

```bash
npm run dev    # Start development build with watch mode
```

### Production Build
To create a new production build:

```bash
npm run build  # Build for production
```

### Project Structure
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
│   │   ├── popup.jsx          # Popup entry point
│   │   ├── App.jsx            # Main React component
│   │   └── popup.css          # Popup styles
│   └── utils/                 # Shared utilities
│       └── helpers.js         # Common helper functions
├── dist/                      # Built extension (ready to load)
├── icons/                     # Extension icons
└── docs/                      # Documentation
```

## 🔧 Customization

### Adding New Export Formats
1. Edit `src/content/export.js` to add new export methods
2. Update `src/popup/App.jsx` to include the new format in the UI
3. Rebuild the extension

### Extending Tailwind Detection
1. Modify `TAILWIND_PATTERNS` in `src/content/extractStyles.js`
2. Add new pattern matching logic as needed

### Changing UI Appearance
1. Edit `src/popup/App.jsx` for React components
2. Modify `src/popup/popup.css` for styling
3. Update `tailwind.config.js` for Tailwind customizations

## 🧪 Quick Test

To verify the extension is working correctly:

1. **Install the extension** following the steps above
2. **Open the test page**: Open `test-page.html` from this project folder in Chrome, or visit any simple webpage like:
   - `https://example.com`
   - `https://wikipedia.org`
   - `https://github.com`
3. **Click the Snatch UI icon** in your toolbar
4. **Click "Start Selecting"**
5. **You should see**:
   - Page gets a slight blue tint overlay
   - A notification appears: "🎯 Snatch UI Active"
   - Elements highlight with blue border when you hover
6. **Click any element** and you should see:
   - Border changes to green (selected)
   - "Extract Component" button becomes available in popup

**Pro Tip**: The included `test-page.html` file has various UI components specifically designed for testing the extension!

If any step fails, check the troubleshooting section below.

## 🐛 Troubleshooting

### Extension Not Loading
- Make sure you're loading the `dist` folder, not the root project folder
- Check that Developer mode is enabled in Chrome extensions

### "Could not establish connection" Error
**This has been FIXED!** The latest build includes:
- ✅ Automatic content script injection if not already present
- ✅ Better error handling for page compatibility
- ✅ Ping/pong system to verify content script is ready
- ✅ User-friendly error messages

### Selector Not Working
- Refresh the webpage after loading the extension
- Check the browser console for any JavaScript errors
- Some websites may have strict Content Security Policies
- Try the extension on a simple webpage first (like Wikipedia or GitHub)

### Cannot Use on Certain Pages
The extension won't work on:
- `chrome://` pages (Chrome internal pages)
- `chrome-extension://` pages (Extension pages)
- Some heavily secured websites

### Extraction Issues
- Try selecting a different element
- Check if the page uses complex CSS frameworks
- Look for errors in the extension popup

## 🎯 Tips for Best Results

1. **Select Specific Components** - Choose the smallest meaningful UI component
2. **Test Different Pages** - Try the extension on various websites
3. **Check Extracted Code** - Review the generated code before using
4. **Preserve Tailwind** - Enable the setting to keep Tailwind classes
5. **Clean Up Code** - The extracted code may need minor adjustments

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Try refreshing the page and reloading the extension
3. Test on different websites to isolate the issue

---

**Happy Component Snatching! 🎯**
