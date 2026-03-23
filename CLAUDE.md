# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Jackpot 777** is a Facebook Messenger WebView minigame — a 3-reel slot machine where users get 3 spins per session. Landing 3 matching numbers (any digit 0-9) wins a prize. Designed for mobile-first, runs inside Facebook Messenger's WebView.

**Lead-first flow:** Login (phone capture) → Game (3 spins) → Result (win/lose celebration) → NocoDB storage.

## Game Logic

- **3 reels**, each spinning to a random digit `0–9`
- **Win condition:** All 3 reels show the same number
- **Spin limit:** 3 spins per session (tracked in JS, can persist in NocoDB)
- **Session storage:** `sessionStorage` for spins remaining, current phone
- **NocoDB storage:** On login, store lead with phone; after each spin, store result

## Architecture

### Screens (3-file SPA approach)
Each HTML file is a self-contained screen. Navigation uses JS to show/hide screens (no routing needed for WebView).

| File | Purpose | Key State |
|---|---|---|
| `login.html` | Phone capture → start game | `phone` validated `/^0[3-9]\d{8}$/` |
| `game.html` | 3-reel slot machine | `spinsLeft`, `reelValues[3]`, `isSpinning` |
| `result.html` | Win/Lose celebration | `winAmount`, `prizeCode`, `reelValues` |

### Shared Design System
- **Font stack:** Space Grotesk (headlines/displays), Plus Jakarta Sans (body/labels)
- **Palette:** Deep purple base (`#150629`), gold primary (`#ffe792`), ruby secondary (`#ff6c8f`), violet tertiary (`#c47fff`)
- **Tailwind CDN** with inline `tailwind.config` in a `<script id="tailwind-config">` tag — both tailwind scripts (link + config) must be present on every page
- **Animations:** `pulse-glow`, `float`, `rain` (coin particle fall), `fadeInUp`, `shake`, `bounceIn` — defined in `game.html` via Tailwind keyframes and in `<style>` blocks
- **Material Symbols Outlined** for all icons — use `style="font-variation-settings: 'FILL' 1;"` for filled variants

### Key Implementation Patterns

**Screen transition (JS):**
```javascript
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById('screen-' + id).classList.remove('hidden');
}
```

**Reel spin animation:**
Each reel is a flex column of symbols. During spin, rapidly cycle the visible symbol (CSS animation or JS interval at ~50ms). On stop, snap to final random value with a spring-bounce easing.

**Win detection:**
```javascript
const isWin = reelValues[0] === reelValues[1] && reelValues[1] === reelValues[2];
```

**Confetti / particle burst:** Canvas-based or CSS-animated elements appended to container, auto-removed after animation completes.

### NocoDB Integration

Tables needed:
- `leads` — `id`, `phone`, `created_at`
- `spin_results` — `id`, `lead_id` (FK), `reel1`, `reel2`, `reel3`, `is_win`, `prize_code`, `created_at`

API calls use `fetch` to NocoDB REST API:
```
POST /api/v1/db/data/v1/{project}/{table}
Headers: "xc-token: {NOCO_TOKEN}"
```

Environment variables (`.env` or Vercel env vars):
```
NOCO_URL=https://your-nocodb.app
NOCO_TOKEN=your-nocodb-api-token
```

### Deployment

- **Vercel** — `vercel deploy` or connect GitHub repo
- Files served as static — no build step needed
- All assets (fonts, icons) loaded from CDN (Google Fonts, Material Symbols)
- Facebook Messenger WebView: set `viewport-fit=cover` in meta for safe area handling

## Workflow

1. **Dev locally:** Open `login.html` directly in browser (or serve with `npx serve .`)
2. **Preview game:** Open `game.html` directly for UI testing
3. **NocoDB setup:** Create tables per schema above, get API token
4. **Deploy:** `vercel --prod` after pushing to GitHub
5. **Facebook:** Set WebView URL to Vercel deployment URL

## Design System Reference

See `DESIGN.md` for the full "Neon Royale" design language — color tokens, typography scale, component rules (glossy buttons, glass panels, no-line sectioning, ambient glow shadows). The skill reference at `C:\Users\Te\.claude\skills\minigame-lead-gen\SKILL.md` contains the component library (glass-card, btn-premium, input-float, particle system, confetti burst) that should be referenced for lead-form and victory-screen patterns.
