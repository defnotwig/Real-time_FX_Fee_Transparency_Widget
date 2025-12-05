Instructions – Real-Time FX & Fee Transparency Widget

Focus: ship a single, embeddable React 18 + Tailwind component that shows USDC → fiat with transparent fees and trusted UX.

Priority
1) Correct math (gross, fees, spread, net, effective rate) per spec.
2) Accessibility & mobile-first (≥320px, focus, aria, contrast, 44px targets).
3) Formatting clarity (Intl.NumberFormat, symbols, decimals, red fees, green totals).
4) Responsiveness and performance (<100ms recompute, minimal rerenders).
5) Documentation/tests for edge cases.

Scope & Non-goals
- Default: no backend, no database, no secrets. Mock rates/fees live in code.
- If live rates needed, make it opt-in via props; validate data and keep fallback.
- Avoid adding global CSS or external state managers.

Component Expectations
- Inputs: amount (positive, max 2dp), presets, currency selector (PHP/THB/IDR/MYR), optional direction toggle.
- Output: headline “You send X USDC → Recipient gets Y {currency}”, breakdown with line items and divider, final net emphasized.
- Optional: comparison view, theme toggle, math expander, brand color override, onConversionComplete callback.

Styling & Layout
- Tailwind utilities only; no global leakage. Use tabular/monospace for numbers; align decimals.
- Color roles: primary blue-600, success green-600, danger red-600, neutral gray-600/900, borders gray-200, dark bg gray-900.
- Mobile stack; side-by-side on desktop; no horizontal scroll.

Validation & States
- Reject negatives; zero shows prompt; cap decimals to 2. Handle <0.01 (min fee) and >1,000,000 gracefully.
- aria-labels on inputs/toggles; aria-live on results. Visible focus in light/dark.

Testing Checklist (essentials)
- All four currencies compute correctly; presets instant; currency switch recalculates.
- Edge cases: 0, 0.01, 1,000,000 USDC; negative blocked; rapid toggles stable.
- UI: breakdown alignment, red fees, green totals, divider before final net; 320/768/1920 layouts.

Process
- Read relevant files first; keep changes focused.
- Add/update docs in /agents and docs/features when behavior changes.
- Prefer const, hooks, memoization; no var, no unused deps.
- Do not modify lockfiles or migrations.

Security & Data
- No secrets/PII. No logging user amounts remotely. If fetch added, validate numbers and clamp decimals.

Commits/PRs
- Use conventional prefixes (feat:, fix:, docs:, refactor:). Keep PRs scoped to widget changes.
