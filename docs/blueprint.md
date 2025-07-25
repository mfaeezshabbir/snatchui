# 🧠 Snatch UI – Project Blueprint

### 🧾 **Project Name:** Snatch UI

> A browser extension that allows users to visually select a UI component from any webpage and extract its **HTML**, **CSS**, and **Tailwind classes**—cleanly and instantly.

---

### 🎯 **Core Features (MVP)**

#### 1. Component Selector (Overlay)

- Highlight any DOM element on hover
- Click to lock/select component
- Optional: Up/down arrows to adjust depth (parent/child)

#### 2. DOM & Style Extractor

- Extract:

  - HTML
  - Class names
  - Inline styles
  - Tailwind classes (if used)

- Parse and merge all relevant styles (from stylesheets and inline)

#### 3. Tailwind Support

- Detect if a class is from Tailwind
- Preserve Tailwind utility classes
- Fallback: Convert computed styles to Tailwind (partial AI mapping)

#### 4. Export Options

- Copy to clipboard
- Download as:

  - HTML + CSS file
  - React (JSX) + CSS
  - Tailwind JSX (if applicable)

#### 5. Extension UI (Popup)

- Button: “Snatch Component”
- Modal: Shows preview of HTML/CSS
- Export settings: Tailwind, JSX, HTML-only

---

### 🧰 **Tech Stack**

| Part                  | Tech                                            |
| --------------------- | ----------------------------------------------- |
| Extension             | Chrome Extension (Manifest V3)                  |
| UI                    | React + TailwindCSS                             |
| Style Parsing         | `window.getComputedStyle`, `csstree`, `postcss` |
| Tailwind Detection    | Regex matching + Tailwind class list            |
| Optional (AI mapping) | OpenAI API for CSS-to-Tailwind mapping          |

---

### 🔧 Folder Structure Example

```bash
snatch-ui-extension/
│
├── public/
│   └── icon.png
│
├── src/
│   ├── content/
│   │   └── selector.js        # Injected into page
│   ├── popup/
│   │   ├── App.jsx
│   │   └── styles.css
│   ├── background.js
│   └── utils/
│       └── extractStyles.js
│
├── manifest.json
├── tailwind.config.js
└── README.md
```
