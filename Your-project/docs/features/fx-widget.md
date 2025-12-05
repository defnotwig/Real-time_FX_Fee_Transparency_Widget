# Real-Time FX & Fee Transparency Widget

> **BOUNTY 7500** - An elegant, embeddable FX & fee transparency widget for Ripe's stablecoin → fiat conversion.

## Overview

The FX Widget provides users with complete transparency into stablecoin-to-fiat conversions, showing exactly how much fiat they receive and where every cent goes. It showcases Ripe's pricing advantage over traditional banking solutions.

## Features

### 1. Direction Toggle (Send vs Receive)

Users can switch between two calculation modes:

- **"I'm sending"** - Enter USDC amount to see fiat received
- **"They receive"** - Enter target fiat amount to calculate required USDC

```jsx
<DirectionToggle
  direction={direction}
  onToggle={handleDirectionToggle}
  isDark={isDark}
/>
```

### 2. Real-Time Conversion Display

Shows live calculations with:

- USDC amount being sent
- Net fiat amount received
- Effective exchange rate
- Comparison to interbank rate

### 3. Transparent Fee Breakdown

Every fee is itemized and explained:

| Fee Type        | Rate       | Description              |
| --------------- | ---------- | ------------------------ |
| Transaction Fee | 0.5%       | Ripe's processing fee    |
| Network Fee     | $2.00 flat | Blockchain gas costs     |
| FX Spread       | ~0.85%     | Built into customer rate |

**Minimum fee**: $0.25 USDC

### 4. Multi-Currency Support

| Currency | Symbol | Flag | Interbank Rate | Customer Rate |
| -------- | ------ | ---- | -------------- | ------------- |
| PHP      | ₱      | 🇵🇭   | 59.00          | 58.50         |
| THB      | ฿      | 🇹🇭   | 35.50          | 35.20         |
| IDR      | Rp     | 🇮🇩   | 15,800         | 15,650        |
| MYR      | RM     | 🇲🇾   | 4.65           | 4.60          |

### 5. Preset Amount Buttons

Quick selection buttons for common amounts:

- 10 USDC
- 50 USDC
- 100 USDC
- 500 USDC
- 1000 USDC (displayed as "1K")

### 6. Comparison View (Ripe vs Legacy)

Side-by-side comparison showing savings:

**Traditional Bank Fees:**

- Transaction fee: 3.0%
- Network fee: $5.00
- Hidden FX spread: ~2.5%

**Ripe Fees:**

- Transaction fee: 0.5%
- Network fee: $2.00
- FX spread: ~0.85% (transparent)

### 7. Detailed Math Expander

Expandable section showing step-by-step calculations:

1. Apply customer FX rate
2. Calculate transaction fee
3. Add network fee
4. Calculate net amount
5. Show effective rate

### 8. Theme Toggle (Light/Dark)

Full dark mode support with appropriate color contrasts:

- Light mode: White background, gray accents
- Dark mode: Gray-900 background, lighter text

## Usage

### Basic Integration

```jsx
import FXWidget from "./FXWidget";

function App() {
  return (
    <FXWidget
      defaultCurrency="PHP"
      defaultAmount={100}
      showComparison={true}
      showDirectionToggle={true}
      onConversionComplete={(result) => console.log(result)}
    />
  );
}
```

### Props

| Prop                   | Type              | Default   | Description                     |
| ---------------------- | ----------------- | --------- | ------------------------------- |
| `defaultCurrency`      | string            | "PHP"     | Initial currency selection      |
| `defaultAmount`        | number            | 100       | Initial amount value            |
| `theme`                | "light" \| "dark" | "light"   | Initial theme                   |
| `showComparison`       | boolean           | true      | Show/hide legacy comparison     |
| `showDirectionToggle`  | boolean           | true      | Show/hide send/receive toggle   |
| `brandColor`           | string            | "#3B82F6" | Primary brand color             |
| `onConversionComplete` | function          | undefined | Callback with conversion result |

### Standalone Demo

Open `demo.html` directly in a browser - no build tools required. Uses:

- React 18 via CDN
- Tailwind CSS via CDN
- Babel standalone for JSX

## Accessibility

The widget implements WCAG 2.1 AA guidelines:

- ✅ Semantic HTML with proper headings
- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Focus indicators (ring styles)
- ✅ 44px minimum touch targets
- ✅ Color contrast compliance
- ✅ Screen reader announcements (`aria-live`)
- ✅ Error state communication (`aria-invalid`, `aria-describedby`)

## Responsive Design

Mobile-first approach with breakpoints:

- **Mobile** (< 640px): Stacked layout, 2-column currency grid
- **Desktop** (≥ 640px): Horizontal results, 4-column currency grid

## Input Validation

- Maximum amount: 1,000,000 USDC
- Minimum amount: 0.01 USDC
- Decimal precision: 2 places
- Real-time error feedback
- Prevents negative values

## Calculation Functions

### `calculateConversion(usdcAmount, currency)`

Forward calculation for "Send" mode.

**Returns:**

```typescript
{
  grossFiat: number,
  transactionFee: number,
  transactionFeeInFiat: number,
  networkFee: number,
  fxSpread: number,
  fxSpreadPercent: number,
  netFiatReceived: number,
  effectiveRate: number,
  totalFeesInFiat: number,
  totalFeesPercent: number,
  customerRate: number,
  interbankRate: number
}
```

### `calculateReverseConversion(fiatAmount, currency)`

Reverse calculation for "Receive" mode. Calculates required USDC to receive exact fiat amount.

### `calculateLegacyConversion(usdcAmount, currency)`

Simulates traditional bank conversion for comparison view.

## File Structure

```
Frontend/
├── FXWidget.jsx      # Main React component (production)
├── demo.html         # Standalone demo (no build required)
├── index.html        # Build-based demo entry
├── package.json      # Project dependencies
└── tailwind.config.js
```

## Dependencies

- **React 18** - UI library
- **Lucide React** - Icon library
- **Tailwind CSS** - Utility-first styling

## Performance Optimizations

- `useMemo` for computed values (conversion results, savings)
- `useCallback` for event handlers
- Conditional rendering for optional sections
- Tabular numerals for aligned number display

## Trust Signals

Footer displays:

- "All fees shown upfront" (Shield icon)
- "No hidden charges" (Check icon)
- "Real-time rates" (Refresh icon)

### Supported Stablecoins

Visual badges for supported tokens:

- **USDC** - Circle's USD Coin
- **USDT** - Tether
- **USDG** - Paxos Gold-backed

### Ripe Branding

Uses official Ripe tagline: **"From stablecoin to e-wallet — instant settlement"**

Target markets: Southeast Asia (Philippines, Thailand, Indonesia, Malaysia)

---

**Last Updated:** December 2024 - BOUNTY 7500 completion
