# UI/UX Validator – Ripe FX & Fee Transparency Widget

> **Mission:** Build an elegant, embeddable FX widget that showcases Ripe's pricing advantage. Users must instantly see "How much fiat do I actually receive?" and "Where did every cent go?" — making fees so clear that people instinctively trust the "Net Fiat Received" number.

---

## Ripe Design Language

Based on [ripe.money](https://www.ripe.money/), the widget should embody:

### Brand Identity

- **Tagline:** "From stablecoin to e-wallet" — instant settlement
- **Tone:** Modern fintech, trustworthy, accessible, clean
- **Target:** Southeast Asia (PHP, THB, IDR, MYR) — freelancers, remittances, everyday payments

### Color Palette

| Role         | Light Mode            | Dark Mode             | Usage                                  |
| ------------ | --------------------- | --------------------- | -------------------------------------- |
| Primary      | `#3B82F6` (blue-600)  | `#60A5FA` (blue-400)  | Headers, CTAs, Ripe brand              |
| Success      | `#16A34A` (green-600) | `#4ADE80` (green-400) | Net received, positive values, savings |
| Danger       | `#DC2626` (red-600)   | `#F87171` (red-400)   | Fees, deductions, legacy comparison    |
| Neutral Text | `#111827` (gray-900)  | `#F9FAFB` (gray-50)   | Primary text                           |
| Muted Text   | `#6B7280` (gray-500)  | `#9CA3AF` (gray-400)  | Labels, hints                          |
| Borders      | `#E5E7EB` (gray-200)  | `#374151` (gray-700)  | Cards, dividers                        |
| Surface      | `#FFFFFF`             | `#111827` (gray-900)  | Card backgrounds                       |
| Card BG      | `#F9FAFB` (gray-50)   | `#1F2937` (gray-800)  | Nested sections                        |

### Typography

- **Font:** System font stack (SF Pro, Inter, Segoe UI)
- **Numbers:** `font-mono` or `tabular-nums` for decimal alignment
- **Hierarchy:**
  - H1/Widget Title: 24px bold
  - Headline Amounts: 28-32px bold (USDC blue, Fiat green)
  - Section Headers: 18px semibold
  - Body/Labels: 14px regular
  - Hints/Fine Print: 12px muted

### Spacing & Layout

- **Container:** Rounded corners (16px), subtle shadow, self-contained card
- **Section Padding:** 16-24px
- **Gap Between Elements:** 12-16px
- **Mobile-first:** Stack on small screens, side-by-side on ≥640px

---

## Trust-Building UX Requirements

The widget exists to make users **trust** the final number. Every design choice serves transparency.

### 1. Headline Clarity

```
You send 100.00 USDC → Recipient gets ₱5,703.75
```

- USDC amount in **blue** (sending)
- Fiat amount in **green** (receiving)
- Arrow icon between them
- Large, readable, instant comprehension

### 2. Fee Breakdown Section

Every deduction must be visible:

```
Gross at ₱58.50          ₱5,850.00
− Ripe fee (0.5%)         −₱29.25     ← Red
− Network fee             −₱117.00    ← Red
FX spread (0.85%)         Transparent ← Green badge
────────────────────────────────────
Net amount received       ₱5,703.75   ← Large green
```

**Design Rules:**

- Right-align all amounts with `tabular-nums`
- Prefix deductions with `−` (minus sign)
- Color deductions red, totals green
- Horizontal divider before final net
- Final net is **larger and bolder** than other lines

### 3. "Where Every Cent Goes" Philosophy

- No hidden fees — everything itemized
- Show FX spread explicitly, even if built into rate
- Label each fee clearly (what it is, why it exists)
- Optional: collapsible "View detailed math" for step-by-step

### 4. Comparison View (Ripe vs Legacy)

Side-by-side cards showing:

```
┌─────────────────┐  ┌─────────────────┐
│  Traditional    │  │      Ripe       │
│    Bank         │  │     ✓           │
│  ₱5,432.10      │  │  ₱5,703.75      │
│  (3% + $5 + 2.5%)│  │  (0.5% + $2)    │
└─────────────────┘  └─────────────────┘
       ↓ You save ₱271.65 with Ripe ↓
```

- Legacy card: muted, red accents
- Ripe card: highlighted border, green accents
- Savings callout: gradient background, prominent

---

## Validation Checklist

### Must Pass (Blocking)

- [ ] **Net Fiat Received** is the most prominent number on screen
- [ ] All fees visible in breakdown — nothing hidden
- [ ] Numbers match: headline net = breakdown net = math expander net
- [ ] Currency symbols correct: ₱ (PHP), ฿ (THB), Rp (IDR), RM (MYR)
- [ ] IDR uses 0 decimal places; others use 2
- [ ] Amounts are right-aligned and decimal-aligned
- [ ] Deductions show minus sign and red color
- [ ] Final net shows green color and bold weight
- [ ] Divider line before final net amount
- [ ] Touch targets ≥44px on mobile
- [ ] Visible focus rings on all interactive elements
- [ ] `aria-live` on results section for screen readers
- [ ] No horizontal scroll at 320px width

### Input Validation

- [ ] Empty/zero: Shows "Enter an amount" prompt
- [ ] Negative: Blocked with clear error message
- [ ] > 2 decimals: Rounded to 2 places
- [ ] > 1,000,000: Shows max limit error
- [ ] <0.01: Applies minimum fee correctly
- [ ] Non-numeric: Shows "Enter a valid number" error

### Responsive Breakpoints

| Viewport | Layout                                         |
| -------- | ---------------------------------------------- |
| 320px    | Stacked, 2-col currency grid, vertical results |
| 640px+   | Side-by-side results, 4-col currency grid      |
| 768px+   | Comfortable spacing, larger fonts              |

### Accessibility (WCAG AA)

- [ ] Color contrast ≥4.5:1 for text
- [ ] Focus visible on all controls
- [ ] Labels associated with inputs
- [ ] Error messages in `aria-describedby`
- [ ] Results announced via `aria-live="polite"`
- [ ] Tab order is logical (inputs → presets → currency → results)

---

## Quick Test Script

### Functional Tests

1. **100 USDC → PHP**: Verify gross = ₱5,850, fees deducted, net ≈ ₱5,703.75
2. **0 USDC**: Shows prompt, no calculations displayed
3. **-10 USDC**: Error message, rejected
4. **0.001 USDC**: Rounds to 0.00, shows minimum prompt
5. **1,000,000 USDC**: Handles gracefully (or shows max error)
6. **Rapid currency switch**: No stale values, smooth recalc

### Visual Tests

1. **Light/Dark toggle**: All elements themed correctly
2. **Breakdown alignment**: Decimals line up vertically
3. **Comparison cards**: Ripe visually "wins" (green border, checkmark)
4. **Mobile 320px**: No overflow, readable, tappable

### Accessibility Tests

1. **Keyboard only**: Tab through all controls, Enter/Space activates
2. **Screen reader**: Results announced on change
3. **Zoom 200%**: Layout remains usable

---

## Common Issues to Flag

### 🔴 Critical (Blocking)

- Headline net ≠ breakdown net (calculation mismatch)
- Fees not visible or poorly labeled
- Numbers overflow container on small screens
- No focus indicator on interactive elements
- Missing `aria-label` on input field

### 🟡 Important (Should Fix)

- Decimals not aligned in breakdown
- Deductions missing minus sign or red color
- Comparison view math inconsistent
- Low contrast in dark mode
- Layout shift during calculations

### 🟢 Minor (Nice to Have)

- Animation polish on expand/collapse
- Micro-interactions on hover states
- Gradient refinements on savings banner
- Icon consistency across sections

---

## Review Feedback Template

```markdown
## FX Widget UI/UX Review

### Overall

[Pass/Needs Work] — [One-line summary]

### Trust & Transparency

- [ ] Net Fiat Received prominent: [Pass/Fail]
- [ ] All fees itemized: [Pass/Fail]
- [ ] Numbers consistent: [Pass/Fail]

### Visual Design

✅ Good:

- [Positive observation]

🔴 Critical:

- [Blocking issue]

🟡 Improvements:

- [Suggested enhancement]

### Accessibility

- Keyboard: [Pass/Fail]
- Screen reader: [Pass/Fail]
- Contrast: [Pass/Fail]

### Responsive

- 320px: [Pass/Fail]
- 768px: [Pass/Fail]
- 1920px: [Pass/Fail]

### Action Items

1. [Priority fix]
2. [Secondary fix]
```

---

## Ripe Brand Alignment

### Footer Elements

Must include trust signals:

- 🛡️ "All fees shown upfront"
- ✓ "No hidden charges"
- 🔄 "Real-time rates"

### Supported Stablecoins

Display badges for:

- **USDC** (Circle)
- **USDT** (Tether)
- **USDG** (Paxos)

### Powered By

```
Powered by Ripe — From stablecoin to e-wallet
```

---

## Testing Tools

| Tool                     | Purpose                  |
| ------------------------ | ------------------------ |
| axe DevTools             | Accessibility scanning   |
| Lighthouse               | Performance & a11y audit |
| Chrome DevTools          | Responsive testing       |
| NVDA/VoiceOver           | Screen reader testing    |
| Colour Contrast Analyser | WCAG contrast check      |

---

_This validator ensures the FX widget achieves its mission: making stablecoin→fiat fees so transparent that users instinctively trust what they see._
