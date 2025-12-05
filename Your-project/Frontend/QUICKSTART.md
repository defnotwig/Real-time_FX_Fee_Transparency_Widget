# 🚀 Quick Start Guide - Ripe FX Widget

## Option 1: Instant Demo (No Installation)

### Step 1: Open the Demo

```bash
# Navigate to the Frontend folder
cd "Your-project/Frontend"

# Open index.html in your browser
# Windows:
start index.html

# macOS:
open index.html

# Linux:
xdg-open index.html
```

### Step 2: Test It Out

- Change the amount (try 10, 100, 1000)
- Switch currencies (PHP, THB, IDR, MYR)
- Toggle dark/light theme
- Expand detailed calculations
- Compare with legacy banks

That's it! The demo runs entirely in your browser with no build tools required.

---

## Option 2: Integrate into Existing React App

### Prerequisites

- Node.js 18+ installed
- Existing React 18+ project
- Tailwind CSS configured

### Step 1: Copy the Component

```bash
# Copy FXWidget.jsx to your components folder
cp FXWidget.jsx /path/to/your-project/src/components/
```

### Step 2: Install Dependencies

```bash
npm install lucide-react
# or
yarn add lucide-react
```

### Step 3: Import and Use

```jsx
// In your app (e.g., App.jsx)
import FXWidget from "./components/FXWidget";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <FXWidget
        defaultCurrency="PHP"
        defaultAmount={100}
        showComparison={true}
      />
    </div>
  );
}

export default App;
```

### Step 4: Ensure Tailwind is Configured

```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};
```

---

## Option 3: CDN Setup (No Build Tools)

### Create index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FX Widget</title>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- React & ReactDOM -->
    <script
      crossorigin
      src="https://unpkg.com/react@18/umd/react.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
    ></script>

    <!-- Babel for JSX -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
  </head>
  <body>
    <div id="root"></div>

    <!-- Your widget component -->
    <script type="text/babel" src="FXWidget.jsx"></script>

    <!-- Initialize -->
    <script type="text/babel">
      const {
        ArrowRight,
        Info,
        Sun,
        Moon,
        ChevronDown,
        ChevronUp,
        TrendingDown,
      } = lucide;

      const root = ReactDOM.createRoot(document.getElementById("root"));
      root.render(<FXWidget />);
    </script>
  </body>
</html>
```

---

## Option 4: Modern Build Setup (Vite)

### Step 1: Create Vite Project

```bash
npm create vite@latest ripe-fx-widget -- --template react
cd ripe-fx-widget
```

### Step 2: Install Dependencies

```bash
npm install
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react
npx tailwindcss init -p
```

### Step 3: Configure Tailwind

```js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 4: Add FXWidget Component

```bash
# Copy FXWidget.jsx to src/components/
cp FXWidget.jsx src/components/
```

### Step 5: Use in App

```jsx
// src/App.jsx
import FXWidget from "./components/FXWidget";
import "./index.css";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="max-w-2xl mx-auto">
        <FXWidget />
      </div>
    </div>
  );
}

export default App;
```

### Step 6: Run Development Server

```bash
npm run dev
# Open http://localhost:5173
```

---

## Option 5: Next.js Integration

### Step 1: Create Next.js App

```bash
npx create-next-app@latest ripe-fx-widget
# Select: Yes to TypeScript, Tailwind, App Router
cd ripe-fx-widget
```

### Step 2: Install Lucide

```bash
npm install lucide-react
```

### Step 3: Create Component

```jsx
// app/components/FXWidget.jsx
"use client"; // Important for Next.js App Router

import React, { useState, useMemo } from "react";
// ... rest of FXWidget code
```

### Step 4: Use in Page

```jsx
// app/page.jsx
import FXWidget from "./components/FXWidget";

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <FXWidget />
    </main>
  );
}
```

### Step 5: Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## Customization Examples

### Custom Brand Color

```jsx
<FXWidget brandColor="#FF6B6B" />
```

### Different Default Currency

```jsx
<FXWidget defaultCurrency="THB" defaultAmount={500} />
```

### Dark Theme by Default

```jsx
<FXWidget theme="dark" />
```

### Hide Comparison View

```jsx
<FXWidget showComparison={false} />
```

### Handle Conversion Events

```jsx
<FXWidget
  onConversionComplete={(result) => {
    console.log("Net amount:", result.netFiatReceived);
    // Send to analytics, update state, etc.
  }}
/>
```

---

## Troubleshooting

### Icons Not Showing

**Problem**: Lucide icons render as empty boxes

**Solution**:

```jsx
// Make sure to import/destructure icons
const { ArrowRight, Info, Sun, Moon } = lucide; // CDN
// or
import { ArrowRight, Info, Sun, Moon } from "lucide-react"; // NPM
```

### Tailwind Styles Not Applied

**Problem**: Component has no styling

**Solution**:

1. Check `tailwind.config.js` includes component path
2. Import Tailwind CSS in your main file
3. Verify Tailwind CDN loaded (check Network tab)

### Dark Mode Not Working

**Problem**: Theme toggle doesn't change appearance

**Solution**:

```js
// tailwind.config.js must have:
module.exports = {
  darkMode: "class", // Not 'media'
  // ...
};
```

### Number Input Weird on Mobile

**Problem**: Input zooms in on focus (iOS)

**Solution**: Already handled with `font-size: 16px+` in component

---

## Production Checklist

- [ ] Component renders without errors
- [ ] All calculations verified manually
- [ ] Tested on mobile devices
- [ ] Dark mode works correctly
- [ ] Accessibility audit passed
- [ ] No console warnings
- [ ] Performance optimized (use React DevTools)
- [ ] Cross-browser tested

---

## Next Steps

1. ✅ **Customize**: Adjust colors, defaults, branding
2. ✅ **Integrate**: Add to your app flow
3. ✅ **Test**: Verify all calculations
4. ✅ **Deploy**: Ship to production
5. ✅ **Monitor**: Track conversions, gather feedback

---

## Support

- **Documentation**: See `README.md` for full API docs
- **Examples**: Check `EXAMPLES.jsx` for 12+ integration patterns
- **Testing**: Review `TESTING.md` for comprehensive test cases

---

**Happy Converting! 🚀**
