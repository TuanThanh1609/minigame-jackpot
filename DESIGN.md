```markdown
# Design System Strategy: The Neon Royale

## 1. Overview & Creative North Star
**Creative North Star: "The Electric High-Roller"**
This design system moves away from the flat, sterile aesthetic of modern fintech and leans into the maximalist, sensory-rich environment of a high-end digital casino. Our goal is to simulate the adrenaline of a physical slot floor through **chromatic depth, light emission, and tactile gloss.**

We reject the "standard" mobile grid. Instead, we utilize **intentional asymmetry** and **overlapping layers** to create a sense of mechanical movement. Elements should feel like they are part of a physical machine—machined, polished, and illuminated from within. We break the template by using extreme typographic scale contrasts and "floating" interactive components that defy traditional container constraints.

## 2. Colors & Atmospheric Depth
The palette is built on a foundation of deep, nocturnal purples to make the "neon" accents vibrate.

- **Primary (Golden Yellow):** Use `primary` (#ffe792) and `primary_container` (#ffd709) for winning moments and high-action triggers.
- **Secondary (Ruby Red):** Use `secondary` (#ff6c8f) for urgency, high-stakes bets, and "Hot" indicators.
- **Tertiary (Neon Purple/Violet):** Use `tertiary` (#c47fff) for secondary interactions and ambient glow.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. We define boundaries through **surface-container shifts**. A betting module (surface-container-high) sits directly on the game floor (surface) without a stroke. The eye should follow the light, not the lines.

### Surface Hierarchy & Nesting
Treat the mobile screen as a 3D space.
- **The Floor:** `surface` (#150629) is your furthest background layer.
- **The Machine Chassis:** `surface_container_low` (#1b0a31) defines the main play area.
- **The Interactive Reels:** `surface_container_highest` (#301a4d) provides the most "lift," suggesting these elements are closest to the glass.

### The "Glass & Gradient" Rule
To achieve a "premium casino" feel, all primary containers must utilize a subtle **linear gradient** (e.g., `primary` to `primary_dim`) to simulate curved, polished surfaces. For overlays, use `surface_variant` at 60% opacity with a `20px` backdrop-blur to create a "Frosted Neon" effect.

## 3. Typography: The Power of Scale
We use two distinct typefaces to balance modern utility with high-stakes excitement.

- **The Engine (Space Grotesk):** Used for `display` and `headline` scales. This is a bold, wide sans-serif that feels architectural. In casino contexts, use `display-lg` (3.5rem) for jackpot numbers to create an overwhelming sense of scale.
- **The Interface (Plus Jakarta Sans):** Used for `title`, `body`, and `labels`. This provides high legibility for rules, odds, and settings.

**Editorial Tip:** Use `letter-spacing: -0.04em` on all `display` styles to make the numbers feel "heavy" and impactful, like physical steel digits.

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "software-like." We use **Ambient Glows** and **Tonal Stacking**.

- **The Layering Principle:** Instead of a shadow, place a `surface_container_highest` card inside a `surface_dim` area. The 15% brightness delta creates a "natural lift" that feels like high-end hardware.
- **Ambient Shadows:** When a component must float (e.g., a "Big Win" modal), use a shadow tinted with the `secondary` (ruby) or `tertiary` (purple) color at 10% opacity with a `48px` blur. This simulates neon light reflecting off the machine's surface.
- **The Ghost Border:** For input fields, use `outline_variant` at 20% opacity. This creates a "suggestion" of a container that doesn't interrupt the visual flow of the deep purple background.

## 5. Components & Signature Elements

### Buttons: The "Glossy Tactility"
- **Primary Action:** Use `primary_container` with a top-down gradient to `primary_dim`. Apply a `xl` (3rem) roundedness for a pill shape.
- **The "Highlight" Stroke:** Add a 2px inner-shadow (white at 30% opacity) to the top edge of buttons to simulate a "light catch" on a plastic button.
- **States:** On press, scale the button to `0.95` and increase the `surface_tint` intensity.

### The "Winning" Chip
Selection chips should use `secondary_container` for the "Active" state. Instead of a checkmark, use a subtle `secondary` glow (`box-shadow: 0 0 15px`) to indicate the chip is "charged."

### Input Fields (Betting)
- **Style:** No background color. Only a bottom-aligned "Ghost Border" using `outline`.
- **Typography:** The bet amount should use `headline-lg` (Space Grotesk) to make the stake feel significant.

### Lists & Leaderboards
- **Forbid Dividers:** Separate "Player Rank" from "Username" using a horizontal spacing of `8` (1.75rem).
- **Alternate Surfaces:** Use a subtle shift from `surface_container_low` to `surface_container` for zebra-striping instead of lines.

### Custom Component: The "Glow Gauge"
A progress bar (for bonus triggers) using a `tertiary` to `secondary` gradient, housed in a `surface_container_lowest` track. The "head" of the progress bar should have a `10px` blur glow to simulate a laser charging.

## 6. Do's and Don'ts

- **DO** use the `24` (5.5rem) spacing token for hero headers to give the numbers "room to breathe."
- **DO** overlap slot symbols (cherries/777s) over container edges to break the "boxed-in" mobile feel.
- **DON'T** use pure white (#FFFFFF) for body text. Use `on_surface_variant` (#b7a3cf) to maintain the "low-light" casino atmosphere.
- **DON'T** use `none` roundedness. Even the sharpest elements should have at least a `sm` (0.5rem) radius to feel machined rather than "digital."
- **DO** ensure the "Collect" or "Spin" button is always the highest point in the `surface-container` hierarchy.