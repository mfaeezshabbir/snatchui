# 📄Fuzzy SRS – Software Requirements Spec (Light)

### 📌 1. Introduction

**Snatch UI** is a Chrome extension that helps frontend developers, designers, and learners extract visual UI components from any live webpage. It enables rapid prototyping, learning, and code reuse.

---

### 🎯 2. Functional Requirements

#### FR1 – Component Highlight & Selection

- Visually highlights elements on mouse hover
- Click to select a component and lock it
- Allow traversal to parent/child via keyboard arrows

#### FR2 – Code & Style Extraction

- Extract full DOM subtree of selected element
- Extract all relevant styles including:

  - Inline
  - Internal
  - External stylesheets (via computed styles)

- Preserve Tailwind utility classes

#### FR3 – Export Options

- Export selected component as:

  - HTML + CSS
  - JSX + Tailwind (if applicable)
  - Plain HTML with inlined styles

- Allow copy-to-clipboard or download

#### FR4 – Popup UI

- Simple interface with:

  - "Snatch" button
  - Preview panel
  - Export options

---

### 📐 3. Non-Functional Requirements

- Cross-browser (Chrome, Edge)
- Lightweight and fast (no page lag)
- Secure (does not send data remotely unless configured)

---

### ⚙️ 4. Optional Future Features

- AI-based Tailwind generator (CSS → Tailwind mapping)
- React/Vue/Svelte export
- Component auto-group detection (via AI)
- Save component library for reuse

---

### 🔍 5. Limitations (MVP)

- Does not handle JS behavior (click handlers, animations)
- May miss dynamically injected styles (unless inline)
- Tailwind conversion only works for utility classes, not complex styles

---
