# Caddell brand rules for BuildOS

> Also paste this file into **v0 → Project → Settings → Instructions** so every
> generation follows it. v0 reads repo files as context, but Instructions are
> enforced on every turn.


You are building **BuildOS**, an internal project-management and pipeline tool for
**Caddell Construction**. Every screen must be on-brand. These rules are not
suggestions.

## Colors — use tokens, never hex

All color comes from the CSS variables already defined in `app/globals.css`.
Never write a raw hex value in a component. Never introduce a color that is not
in this list.

| Token | Value | Use for |
|---|---|---|
| `primary` | `#691C32` Caddell Maroon (PMS 7421) | primary buttons, active nav, key headings, focus ring |
| `gold` | `#F4B223` (PMS 7409) | the one primary CTA per screen, the active-nav indicator, chart series 3 |
| `--caddell-navy` | `#004D71` (PMS 3025) | second data series, informational badges |
| `--caddell-teal` | `#9FCFCA` (PMS 7464) | third data series, low-emphasis fills |
| `--caddell-sage` | `#009877` (PMS 3278) | on-schedule / complete / success |
| `--caddell-gray` | `#B2B4B3` (PMS 421) | dividers, disabled, inactive series |
| `danger` / `destructive` | true red | errors, overdue, blocked, destructive actions only |

Rules:
- Maroon is the default. If one color is needed, it is maroon.
- **Maroon never means "error" or "info."** Overdue/blocked use `danger`,
  informational uses `info` (navy); maroon is identity, not status.
- Gold has exactly two jobs: the single primary CTA on a screen (`variant="cta"`)
  and the active-nav indicator. Never a card, banner, or section background, never
  a second button on the same screen.
- Never tint or shade brand colors ad hoc. If you need a lighter maroon, use
  `--caddell-maroon-050`.

## Type

- **Roboto Condensed** — everything: headings, nav, labels, table text, buttons.
  Wired up as `font-sans` (body/UI) and `font-heading` (headings).
- **Crimson Pro** — the approved serif, for long-form reading only. In this app
  that means the client-facing Showcase/portfolio document. Wired up as `font-display`.
- Never Inter, Geist, Arial, Calibri, Oswald, Archivo, or Open Sans.
- H1/H2 are uppercase with tight tracking. H3 and below are sentence case.

## Logo

- Render it only as `<img src="/caddell-logo*.svg">` / `<img src="/caddell-wordmark*.svg">`
  with `h-* w-auto` (height only — width follows). Never set "CADDELL" in a font,
  never build it from `<div>`s, never use an emoji or Lucide icon as a stand-in.
- Below ~40px tall use the wordmark (no tagline) — the tagline is illegible that small.
- Only maroon, black, or white. No other color, no gradient, no drop shadow, no
  glow, no outline.
- Never stretch, squeeze, rotate, or crop it. Set height only (`h-5 w-auto`);
  never set both `width` and `height`.
- Clearspace on all sides equals the width of the bottom stroke of the "L".
  In practice: `gap-3.5` at 20px tall, `gap-4` at 24px, `gap-6` at 40px+.
  Nothing — text, icons, other logos, dividers — enters that space.
- Never use the retired marks: "CADDELL in a maroon box", the "pacman C", or
  "CADDELL / CONSTRUCTION".
- The tagline **"Constructing What Matters"** lives in the logo and in
  mission-flavored copy (login screen, About, footer). It is a mission statement,
  not a slogan to sprinkle through the UI.

## Form and shape

- Corners are near-square: `--radius` is `0.125rem`. Do not round cards, buttons,
  or inputs beyond that. Avatars and status dots may be circular.
- Layouts are structured and grid-driven. Reference: architectural drawings, not
  consumer SaaS.
- Density over whitespace. This is a tool for people who read schedules and
  budgets all day — favor compact tables, real data, and scannable rows over
  large hero cards.
- No nested navigation more than two levels deep. Flat, direct, labeled.

## Voice in UI copy

Confident, direct, warm. Plain construction English — this audience says
*submittal*, *RFI*, *punch list*, *buyout*, *change order*, *pay app*. No hype,
no exclamation marks, no "Oops!", no emoji in product copy.

Brand descriptors to design toward: clean, bold, iconic, bright, purposeful,
diverse, professional, a construction leader.

## Assets already in the repo

```
public/caddell-logo.svg           primary lockup, maroon + gray tagline (light surfaces)
public/caddell-logo-white.svg     primary lockup, white (maroon / dark surfaces)
public/caddell-logo-black.svg     primary lockup, black (print / mono)
public/caddell-wordmark.svg       secondary logo, no tagline — use below ~40px tall
public/caddell-wordmark-white.svg secondary logo, white
public/icon.svg, apple-icon.png, icon-light-32x32.png, icon-dark-32x32.png
```

These are traced from the official artwork. Never edit the path data, never
regenerate them, never replace them with type.

## Token names in this codebase

`font-heading` / `font-sans` → Roboto Condensed · `font-display` → Crimson Pro
(Showcase only) · `bg-gold` → CTA only · `bg-sidebar` → maroon rail ·
`text-info` → navy · `text-success` → sage · `text-warning` → dark gold ·
`text-danger` → red. Chart series: `chart-1…5` = maroon, navy, gold, sage, teal.
