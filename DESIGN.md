---
name: LAN Drop
description: A local dispatch desk for shipping files across the LAN — labeled, sent, and stamped delivered only once verified.
colors:
  desk-ground: "#17110a"
  kraft-paper: "#e4cfa0"
  kraft-dim: "#cdb37f"
  kraft-shadow: "#a98c58"
  ink: "#241a10"
  ink-soft-on-kraft: "#5c4a34"
  ink-soft-on-desk: "#a4906a"
  on-stamp: "#f7ecd6"
  stamp-red: "#b23a2e"
  stamp-red-deep: "#8c2c22"
  transit-blue: "#2b4d6e"
  transit-blue-light: "#4d7398"
  verified-green: "#356030"
typography:
  display:
    fontFamily: "'Special Elite', 'Courier New', monospace"
    fontSize: "13.5px – 21px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.01em – 0.04em"
  data:
    fontFamily: "'Courier New', Consolas, ui-monospace, monospace"
    fontSize: "10.5px – 14px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal, 0.02em on codes"
  body:
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "12.5px – 14px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: "2px"
  sm: "3px"
  clip: "4px"
spacing:
  tight: "6px"
  sm: "10px"
  md: "16px"
  lg: "22px"
  xl: "30px"
components:
  dispatch-primary:
    backgroundColor: "{colors.stamp-red}"
    textColor: "{colors.on-stamp}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    padding: "13px"
  dispatch-primary-hover:
    backgroundColor: "{colors.stamp-red-deep}"
  dispatch-primary-disabled:
    backgroundColor: "{colors.kraft-dim}"
    textColor: "{colors.ink-soft-on-kraft}"
  manifest-row-selected:
    backgroundColor: "{colors.stamp-red}"
    textColor: "{colors.on-stamp}"
    rounded: "{rounded.none}"
---

# Design System: LAN Drop

## Overview

**Creative North Star: "The Dispatch Desk"**

LAN Drop is not a control panel; it is a desk where local shipments get written up, sent, and stamped. The whole surface is lit like a dispatch clerk's lamp left on at any hour — a dark, warm desk holding kraft-paper documents, never a near-black gradient dashboard with glowing accent panels. Every document on the desk earns its own shape: a ruled clipboard for who is reachable, a perforated shipping label for what is being sent, a wide ledger for what already arrived. Nothing on the page is a same-size card standing in for content.

Trust is the product's actual mechanism (a file is only ever called "delivered" after its checksum is verified on the far end), so the interface makes that verification physical: a real ink-stamp graphic lands on a shipment only once integrity is confirmed. Color is spent almost entirely on that one idea — stamp-red marks the single actionable or live thing on screen, never decoration.

Confirmed anti-references: no dark-panel-plus-blue-violet-gradient SaaS dashboard (the direction this project explicitly replaced), no soft rounded consumer-app card grid, no cream-paper-plus-serif "bookish" default.

**Key Characteristics:**
- Three structurally different documents on one desk, not a grid of matching cards
- A single reserved accent (stamp-red) for actionable and live states only
- Self-hosted display face used nowhere but the stamped voice; system faces stay in their workhorse roles
- Real, verified data (checksums, byte counts, IPs) rendered in a genuine data face, never as costume

## Colors

Palette runs warm and inked: a near-black desk ground, kraft-paper documents, and three semantic inks (action, in-transit, verified) that never bleed into decoration.

### Primary
- **Stamp Red** (`#b23a2e`): the one actionable/live color on the page — the dispatch button and the selected recipient row. Nothing else on the surface uses it.

### Secondary
- **Transit Blue** (`#2b4d6e`): in-progress state — the listening pulse while scanning for peers, the relay leg of a transfer, the claim link on a delivered file.
- **Verified Green** (`#356030`): the confirmation stamp and its badge. Only appears once a checksum has actually matched.

### Neutral
- **Desk Ground** (`#17110a`): the page background; a warm near-black, never a blue-black slate.
- **Kraft Paper** (`#e4cfa0`): the surface of every document (clipboard, label, ledger).
- **Kraft Dim** (`#cdb37f`): disabled states and the ticked progress track.
- **Kraft Shadow** (`#a98c58`): dotted leaders, dashed rules, document borders.
- **Ink** (`#241a10`): primary text on kraft surfaces.
- **Ink Soft on Kraft** (`#5c4a34`): secondary text on kraft surfaces (hints, meta).
- **Ink Soft on Desk** (`#a4906a`): secondary text directly on the desk ground — a lighter, tinted step so it still clears 4.5:1, never the kraft-toned ink-soft used on paper.
- **On Stamp** (`#f7ecd6`): the only text/border color used on top of stamp-red; kraft itself does not carry enough contrast there.

### Named Rules
**The One Accent Rule.** Stamp-red appears only where the user can act right now or where something is actively in flight toward delivery. It never decorates a heading, an icon, or a passive label. If a review finds stamp-red on something inert, that is a defect, not a style choice.

## Typography

**Display Font:** Special Elite (self-hosted, `/fonts/SpecialElite-Regular.ttf`), with 'Courier New', monospace fallback
**Body Font:** Segoe UI, system-ui fallback stack
**Label/Mono Font:** Courier New, Consolas, ui-monospace, monospace

**Character:** A distressed dispatch-office typewriter voice (Special Elite) reserved for the stamped moments and section titles, paired with a plain workhorse data face (Courier New) for anything that is actually a measurement, address, or filename, and a quiet system sans for reading copy. The three never swap roles.

### Hierarchy
- **Display** (400, 15–21px, 1.2): document titles, the wordmark, the impact-stamp burst, the dispatch button label.
- **Data** (400/700, 10.5–14px, 1.4, tabular-nums on numeric values): device codes, IP:port, byte counts, transfer status, ledger columns.
- **Body** (400, 12.5–14px, 1.5, max ~42ch): hints and explanatory copy only.

### Named Rules
**The Data-Face Rule.** Courier New is used only for content that is genuinely data (an address, a hash-adjacent size, a timestamp, a filename) — never as a "technical" costume applied to ordinary labels.

## Layout

A single-column desk (max-width 1100px, centered) holding an asymmetric two-column arrangement (`minmax(260px, 0.85fr) 1.15fr`) of the recipients clipboard and the shipping label, with the delivery ledger spanning full width beneath both. Below 820px the two columns stack and the label's slight rotation is removed; below 540px the ledger's column headers hide and rows collapse to a single stacked column. Card padding runs 22–30px; internal rhythm sits on an 8–14px step for tight groups and 16–26px between documents.

## Elevation & Depth

Documents are physical sheets resting on the desk: each carries a soft, offset drop shadow (`0 18px 34px -14px rgba(0,0,0,.7), 0 3px 8px rgba(0,0,0,.4)`) rather than a flat SaaS card elevation. No glass, no blur-as-decoration. The shipping label additionally uses a dashed perimeter and a punched hole to read as a physical label rather than a panel.

### Named Rules
**The Paper-Not-Panel Rule.** Depth comes from a sheet sitting on a desk (offset + blur, warm cast), never from a cool ambient glow behind a flat card.

## Shapes

Corners stay almost square (2–3px radius) everywhere — this is stationery, not a soft consumer app. The one exception is the clipboard's metal clip (4px) and the circular punch-hole and status dots, which are literal object references, not a rounding system. Borders lean on dashed and dotted rules (document edges, ruled ledger lines, dotted leaders) instead of solid 1px hairlines.

## Components

### Buttons
- **Shape:** 2px radius, effectively square.
- **Primary (Dispatch):** stamp-red background, on-stamp text, Special Elite label, 13px padding, soft red-tinted shadow.
- **Hover / Focus:** background deepens to `#8c2c22` on hover; `:focus-visible` gets a 2px transit-blue-light outline, 3px offset.
- **Disabled:** kraft-dim background, ink-soft-on-kraft text, no shadow.
- **Secondary (file-picker):** kraft background with an ink border, inverts to ink background / kraft text on hover.

### Chips / Badges
- **Ledger stamp:** Special Elite, uppercase, 1.5px solid border in the status color, 2° rotation — verified-green for confirmed, ink with strikethrough for rejected. No fill; it reads as a rubber-stamp impression, not a pill.

### Cards / Containers
- **Corner style:** 2–3px.
- **Background:** kraft paper on all three documents; desk ground behind them.
- **Shadow strategy:** see Elevation & Depth.
- **Border:** none on the clipboard and ledger; 2px dashed kraft-shadow on the shipping label only (its perforated-edge identity).
- **Internal padding:** 22–30px.

### Inputs / Fields
- **Style:** borderless, bottom-dashed only (sender name field), monospace value.
- **Focus:** 2px transit-blue-light outline, 3px offset, border switches dashed → solid.

### Lists (Manifest rows)
- **Style:** Courier New rows with a dotted leader between name and code (classic ledger-line typography), a small verified-green signal dot.
- **Selected state:** the entire row fills stamp-red with on-stamp text — never a colored left border.

### Signature Component: The Impact Stamp
On a verified delivery, a rotated "CONFERIDO" stamp (Special Elite, verified-green outline, −11° rotation) lands on the transfer ticket via a single expo-out scale-in from 2.4× to 1×, no bounce/overshoot. It is the page's one authored motion moment; nothing else animates beyond quiet state transitions.

## Do's and Don'ts

### Do:
- **Do** reserve stamp-red exclusively for the primary action and the live/selected state (The One Accent Rule).
- **Do** keep the three type roles (Special Elite / Courier New / system sans) separated by function, never mixed within one role.
- **Do** give every new document-like surface its own silhouette (border treatment, rotation, or ruling) rather than reusing the same rounded-card shell.
- **Do** verify any new color pairing against 4.5:1 before shipping; `ink-soft` has two variants (on-kraft, on-desk) specifically because one gray does not clear both grounds.

### Don't:
- **Don't** add a colored `border-left`/`border-right` accent to a row or card — selection and status read through fill, stamps, or badges instead.
- **Don't** introduce a second display face; Special Elite is the only stamped voice, used sparingly, never at body-copy sizes.
- **Don't** animate `width`/`height`/`padding` for progress or reveal states — use `transform: scaleX()`/`scale()` so motion stays off the layout thread.
- **Don't** reach for bounce/elastic easing; the page's one signature motion uses expo-out deceleration, no overshoot.
