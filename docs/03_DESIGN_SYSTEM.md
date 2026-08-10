# Neptlium Design System

**Status:** Authoritative — reconstruction in progress  
**Doctrine:** Capital Precision  
**Scope:** Marketing, authenticated product, admin, shared UI  
**Runtime authority target:** `packages/ui/src/styles/tokens.css`

> Capital should feel ordered before it feels impressive.

---

# 1. Typography Authority

Typography is the first layer of Neptlium's visual system.

Marketing and product must feel like one company and one operating system.

They do not use separate visual identities.

Marketing may use larger composition.  
The authenticated product may use greater density.  
Both use the same typographic logic.

Neptlium typography must feel:

- engineered
- calm
- precise
- neutral
- modern
- durable
- highly legible
- financially credible

It must not feel:

- editorially fashionable
- aggressively bold
- luxury-serif driven
- crypto-native
- oversized for spectacle
- compressed or cramped
- loosely aligned
- visually unstable

---

# 2. Governing Principle

Hierarchy must come from:

1. size
2. measure
3. placement
4. contrast
5. spacing
6. weight

Weight is not the primary hierarchy mechanism.

A page must never become a sequence of bold statements competing with each other.

Supporting information must visually recede.

Primary information earns attention.

---

# 3. Font Family

Neptlium uses one durable engineered sans-serif system for ordinary interface and marketing typography.

Canonical stack:

```css
font-family:
  Inter,
  'SF Pro Text',
  'SF Pro Display',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  Helvetica,
  Arial,
  sans-serif;
```

Repository implementation may use the existing approved Inter/system strategy.

Do not add an external font dependency merely to imitate another product.

Do not introduce multiple display families.

Do not use a serif as a core Neptlium identity font.

Do not use monospace for ordinary financial amounts.

---

# 4. Numeric Typography

Financial numerics use the same primary sans family.

Required:

```css
font-variant-numeric: tabular-nums;
font-feature-settings: 'tnum' 1;
```

Use tabular numerals for:

- balances
- quantities
- percentages
- rates
- aligned financial columns
- treasury values
- allocation values
- capital state

Use monospace only for technically meaningful identifiers:

- wallet addresses
- transaction hashes
- API identifiers
- code
- machine-readable references

Financial values must look financial, not developer-oriented.

---

# 5. Weight Architecture

Allowed default hierarchy:

```text
400  Regular
500  Medium
600  Semibold
```

Usage:

```text
400
body copy
supporting statements
long-form text
descriptions
secondary explanation

500
navigation
buttons
labels
metadata emphasis
product controls
table emphasis
small titles

500–600
primary marketing headlines
major application headings

600
rare strong emphasis
critical top-level heading

700+
not part of normal Neptlium composition
```

Do not use 700 merely to make a section feel important.

If a section requires heavy weight to feel important, fix its composition.

---

# 6. Marketing Type Scale

The marketing site is expressive but controlled.

## Display

Desktop:

```text
56–64px typical
72px exceptional maximum
```

Tablet:

```text
48–56px
```

Mobile:

```text
38–46px
```

Recommended line-height:

```text
0.98–1.08
```

Recommended weight:

```text
500–600
```

Display typography is reserved for the primary first-view statement.

Do not use display sizing repeatedly down the page.

## Marketing H1

```text
Desktop: 48–56px
Tablet:  42–48px
Mobile:  36–42px
```

Line-height:

```text
1.02–1.10
```

Weight:

```text
500–600
```

## Marketing H2

```text
Desktop: 36–44px
Tablet:  32–38px
Mobile:  28–34px
```

Line-height:

```text
1.08–1.16
```

Weight:

```text
500–600
```

## Marketing H3

```text
Desktop: 24–30px
Mobile:  22–26px
```

Line-height:

```text
1.15–1.25
```

Weight:

```text
500
```

## Marketing Supporting Statement

```text
Desktop: 18–20px
Mobile:  17–18px
```

Line-height:

```text
1.45–1.60
```

Weight:

```text
400
```

Supporting copy must never visually compete with the headline.

## Marketing Body

```text
Desktop: 16–17px
Mobile:  15–16px
```

Line-height:

```text
1.55–1.70
```

Weight:

```text
400
```

## Marketing Metadata

```text
12–14px
```

Weight:

```text
500
```

Use sparingly.

Avoid unnecessary all-uppercase labels.

---

# 7. Authenticated Product Type Scale

The product is quieter than marketing.

## Page title

```text
Desktop: 26–30px
Mobile:  24–28px
```

Weight:

```text
500–600
```

Line-height:

```text
1.10–1.20
```

## Primary financial figure

```text
Desktop: 36–44px
Mobile:  32–38px
```

Weight:

```text
500
```

Never make balances enormous merely because they are financially important.

## Section heading

```text
17–20px
```

Weight:

```text
500–600
```

## Operational heading

```text
15–17px
```

Weight:

```text
500
```

## Product body

```text
14–16px
```

Weight:

```text
400
```

Line-height:

```text
1.45–1.60
```

## Product metadata

```text
12–13px
```

Weight:

```text
400–500
```

## Micro text

```text
11–12px
```

Use only where the information hierarchy genuinely requires it.

---

# 8. Navigation Typography

Marketing navigation:

```text
14–15px
weight 450–500
line-height 1
```

Authenticated navigation:

```text
13–14px
weight 500
```

Navigation must not become bold branding.

Navigation recedes when the user reaches content.

Active navigation may gain:

- stronger foreground contrast
- precise Blue signal
- structural indicator

Do not make active navigation significantly heavier in weight.

---

# 9. Button Typography

Primary and secondary controls:

```text
14–15px
weight 500
```

Small controls:

```text
13px
weight 500
```

Do not use bold button typography.

CTA authority should come from geometry, contrast, and placement.

---

# 10. Word Spacing and Tracking

Default body tracking:

```css
letter-spacing: normal;
```

Large display:

```css
letter-spacing: -0.025em;
```

Primary headings:

```css
letter-spacing: -0.015em;
```

Small headings:

```css
letter-spacing: -0.005em;
```

Navigation and controls:

```css
letter-spacing: 0;
```

Metadata:

```css
letter-spacing: 0;
```

Do not use wide tracking to manufacture sophistication.

Uppercase overlines, where genuinely necessary:

```css
letter-spacing: 0.06em;
```

Do not apply uppercase overlines systematically to every section.

---

# 11. Text Measure

Typography must never be allowed to run arbitrarily wide.

Recommended measures:

```text
Hero headline:
roughly 620–760px

Hero supporting:
approximately 480–620px

Section heading:
approximately 520–720px

Body / editorial:
approximately 560–680px

Long-form:
approximately 620–720px
```

A wide screen does not justify wide paragraphs.

---

# 12. Line-Break Architecture

Text must never appear to collapse, bend unpredictably, or leave isolated orphan words.

Use line breaks deliberately.

For primary marketing headlines:

- author deliberate line shapes where necessary
- avoid relying entirely on browser wrapping
- keep key phrases together
- do not allow a final one-word line
- do not force unnatural breaks merely for visual effect

CSS may use:

```css
text-wrap: balance;
```

for short marketing headings only.

Body copy should normally use:

```css
text-wrap: pretty;
```

Do not use `text-wrap: balance` on long body paragraphs.

Never use fixed heights around text containers.

Never truncate important marketing or financial statements merely to preserve layout.

---

# 13. Responsive Typography

Typography must scale continuously, not jump between oversized breakpoint presets.

Prefer controlled `clamp()` expressions.

Example design pattern:

```css
font-size: clamp(2.375rem, 4.2vw, 4rem);
```

Exact implementation must be calibrated to the component.

Do not blindly use one clamp formula everywhere.

At narrow widths:

- reduce size before reducing readability
- preserve line height
- preserve text measure
- preserve visual hierarchy
- allow content height to grow naturally

Text must never overlap adjacent product visuals.

---

# 14. Vertical Rhythm

Typography owns vertical rhythm.

Typical relationships:

```text
Eyebrow → headline
12–20px

Headline → supporting statement
20–28px

Supporting statement → CTA
24–32px

Section heading → supporting copy
16–24px

Section heading → product composition
32–56px
```

Avoid arbitrary large gaps.

Do not manufacture premium design using empty 150px gaps around ordinary copy.

---

# 15. Marketing First View

The first view should contain very little textual competition.

Preferred hierarchy:

```text
Navigation

Primary statement

Short supporting statement

Primary action
Optional restrained secondary action

Product / identity composition
```

Do not surround the primary statement with:

- multiple badges
- statistics
- feature indexes
- trust logos
- excessive labels
- long descriptions

A strong first view comes from subtraction.

---

# 16. Marketing Wording Architecture

Marketing copy should be concise and declarative.

Preferred sentence structure:

```text
Strong proposition.

Short explanation of what the system enables.
```

Avoid:

```text
Large vague claim.

Long paragraph explaining several unrelated capabilities,
another promise, another promise, another qualification.
```

Headline language should normally describe:

- the system
- the capital problem
- the operating relationship
- the resulting control

Avoid hype words.

Avoid stacked adjectives.

Avoid repeated use of:

- powerful
- revolutionary
- next-generation
- cutting-edge
- seamless
- world-class
- institutional-grade

unless objectively justified.

---

# 17. Application Wording Architecture

Authenticated product language is operational.

Use:

```text
Available
Reserved
Committed
Pending
Restricted
```

where these states are supported by actual product architecture.

Prefer:

```text
No capital activity yet.
```

over:

```text
Nothing here! Start exploring Neptlium today.
```

Prefer:

```text
Transfer unavailable
```

with truthful explanatory context over promotional error language.

The product does not market itself while the user is operating capital.

---

# 18. Marketing and Product Unity

Marketing and authenticated product use the same:

- font family
- weight philosophy
- tracking philosophy
- numeric behavior
- hierarchy logic
- spacing rhythm
- text rendering rules

They differ in scale and density only.

Marketing:

```text
larger
editorial
spatial
expressive
```

Application:

```text
smaller
operational
dense where useful
quiet
```

A user moving from `neptlium.com` to `app.neptlium.com` must feel that they entered the product, not another brand.

---

# 19. Text Rendering Quality

Use high-quality native text rendering.

Recommended global principles:

```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
font-synthesis: none;
```

Do not fake font weight.

Do not horizontally scale text.

Do not transform text to make it fit.

Do not compress word spacing to repair a layout.

Do not use CSS transforms on text containers for visual alignment.

Typography must remain naturally rendered.

---

# 20. Accessibility

Typography must remain readable at browser zoom.

Do not:

- disable zoom
- use viewport-fixed text dimensions
- place essential text below accessible contrast
- rely on font weight alone for state
- use tiny metadata for important information

Body copy must remain readable on mobile.

Important financial values must remain distinguishable from supporting units.

---

# 21. Implementation Rule

Before modifying a typography component, ask:

1. Is this hierarchy necessary?
2. Is the font size appropriate to its role?
3. Is the weight heavier than necessary?
4. Is the line measure controlled?
5. Can it wrap safely?
6. Does it remain legible on mobile?
7. Does it belong to the same typography system as marketing and product?

If any answer is no, fix the architecture before adding decoration.

---

# 22. Current Implementation Status

The repository contains existing typography and visual implementation from earlier Neptlium iterations.

Those implementations are evidence, not authority.

This document defines the target typography authority.

Runtime tokens and page compositions must be migrated deliberately after audit.

Do not assume existing font sizes, weights, tracking, or wrapping are correct merely because they are currently deployed.

---

# 23. Next Design-System Layer

The next authority layer to define is:

```text
Color
→ Surfaces
→ Depth
→ State
→ Logo
```

Typography is authoritative immediately.

Color and identity remain under active reconstruction until added to this document.
