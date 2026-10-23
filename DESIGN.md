---
name: mlohaza.com
description: "Скло: the past in greyscale archival paper, the automated present in colour and frosted glass."
colors:
  action-teal: "#0B8577"
  action-teal-deep: "#086C61"
  action-teal-wash: "rgba(11,133,119,.12)"
  sea-glass-on-night: "#7FE0CF"
  gate-amber: "#F2A33A"
  gate-amber-wash: "rgba(242,163,58,.18)"
  gate-amber-ink: "#7A4A0B"
  signal-lilac: "#5867E8"
  morning-ground: "#EDF1F5"
  archive-paper: "#E4E7EB"
  glass: "rgba(255,255,255,.58)"
  glass-faint: "rgba(255,255,255,.42)"
  glass-strong: "rgba(255,255,255,.82)"
  teal-light: "rgba(122,208,196,.55)"
  lilac-light: "rgba(170,184,255,.5)"
  peach-light: "rgba(255,206,170,.5)"
  ink: "#13202A"
  slate-muted: "#4F5D69"
  hairline: "rgba(19,32,42,.11)"
  night: "#101820"
  night-text-soft: "#C9D3DB"
  overdue-rust: "#B4462A"
  white: "#FFFFFF"
typography:
  display:
    fontFamily: "Geologica, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(42px, 4.6vw, 76px)"
    fontWeight: 760
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Geologica, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(32px, 3.5vw, 54px)"
    fontWeight: 720
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  figure:
    fontFamily: "Geologica, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "40px"
    fontWeight: 740
    lineHeight: 1
    letterSpacing: "-0.035em"
    fontFeature: "tnum"
  title:
    fontFamily: "Geologica, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(19px, 1.45vw, 22px)"
    fontWeight: 680
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  lead:
    fontFamily: "Geologica, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(19px, 1.45vw, 22px)"
    fontWeight: 380
    lineHeight: 1.45
  body:
    fontFamily: "Geologica, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "17px"
    fontWeight: 380
    lineHeight: 1.55
  label:
    fontFamily: "Geologica, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 620
    lineHeight: 1.45
rounded:
  lg: "28px"
  md: "18px"
  field: "14px"
  caption: "10px"
  pill: "999px"
  device: "58px"
spacing:
  tight: "8px"
  head: "18px"
  panel: "28px"
  panel-phone: "22px"
  block: "48px"
  margin: "32px"
  margin-phone: "20px"
  section: "136px"
  section-phone: "88px"
components:
  button-primary:
    backgroundColor: "{colors.action-teal}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px 26px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.action-teal-deep}"
  button-ghost:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 26px"
    height: "52px"
  button-ghost-hover:
    backgroundColor: "{colors.white}"
  chip:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "9px 16px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  tab-selected:
    backgroundColor: "{colors.action-teal}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "11px 16px"
    height: "48px"
  try-tag:
    backgroundColor: "{colors.action-teal}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 12px 6px 10px"
  glass-panel:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.panel}"
  night-panel:
    backgroundColor: "{colors.night}"
    textColor: "{colors.morning-ground}"
    rounded: "{rounded.lg}"
    padding: "{spacing.panel}"
  gate-node:
    backgroundColor: "{colors.gate-amber}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "10px 14px"
---

# Design System: mlohaza.com

## Overview

**Creative North Star: "Скло: the Archive Turning to Glass"**

The page is a passage from a grey archive into a light glass morning. Manual work of the past appears as full-bleed archival photographs, always in greyscale, set on cool grey paper. The automated present appears in colour: a soft teal, lilac and peach light on a pale ground, frosted white glass panels, and one teal-green action colour. The visitor's own interactions move the page from one state to the other (the hero's colour light fades in as tasks are handed to the agent).

Density is calm and generous: 136px sections, a 1360px frame on 32px margins, one heavy sans face doing every job. Interactives are tactile glass objects (a phone, task cards, a cost calculator, tabs) rather than abstract dashboards. A night-blue surface is used only as a container for "the machine working" (agent flow, result tiles, footer), never as the page ground: the world rejects the dark AI-SaaS page.

**Key Characteristics:**
- Past = greyscale photo on archive paper; present = colour light and frosted glass.
- One action colour (teal-green); amber is reserved for the Human Gate.
- Geologica only, heavy weights, tight negative tracking at size, tabular figures for every number.
- Large soft radii (28px panels, 18px insets) and pill controls.
- One ambient shadow; depth comes from blur and translucency.

## Colors

A cool, low-chroma ground lit by three soft colour lights, with one saturated teal for action and one amber for human decisions.

### Primary
- **Action Teal** (action-teal): every primary button, selected tab, the "try" tag, result nodes and the accent tile, focus rings, range thumbs. White text on it passes AA at 17px/620.
- **Deep Teal** (action-teal-deep): hover/press state of Action Teal and every teal used as text (links, the second hero line, case figures, accent words in copy). Text never uses the lighter teal.
- **Teal Wash** (action-teal-wash): quiet fills for "handled by the agent" states (task state pill, booking agenda).
- **Sea Glass** (sea-glass-on-night): the teal as it appears on night surfaces (flow result figure, lit flow links, footer email hover).

### Secondary
- **Gate Amber** (gate-amber): the Human Gate and nothing else: gate nodes in the flow, gated notifications after hand-off, the gate block in the Calm Ops diagram, the highlighter mark and bullet squares in the Human Gate section. Text on amber is ink.
- **Gate Wash / Gate Ink** (gate-amber-wash, gate-amber-ink): the "needs your approval" state pill on a gated task.

### Tertiary
- **Signal Lilac** (signal-lilac): data-visualisation only, drawn from script: payback-chart bars before break-even and its threshold line, the agent stage of the Calm Ops diagram. Not used for UI controls or text.

### Neutral
- **Morning Ground** (morning-ground): page ground of solution ("present") sections and the nav glass tint.
- **Archive Paper** (archive-paper): ground of problem ("past") sections and the hero; also the hero veil tint.
- **Glass / Glass Faint / Glass Strong**: frosted panel fills at 58% (default panels, cases, rungs, FAQ), 42% (placeholder quote cards), 82% (chips, ghost buttons, photo captions, tips).
- **Teal / Lilac / Peach Light**: the radial colour lights painted onto light sections and the hero colour layer.
- **Ink** (ink): all text and the selected-chip fill.
- **Slate Muted** (slate-muted): secondary text, captions, notes.
- **Hairline** (hairline): 1px borders of glass panels, chips, inputs, nav.
- **Night** (night): container surface for the agent flow, dark result tile and footer. Soft text on it is night-text-soft.
- **Overdue Rust** (overdue-rust): overdue notification text and form errors.

### Named Rules
**The Gate Is Amber Rule.** Amber marks a step where a person approves. If a surface is amber and it is not a Human Gate, it is wrong.

**The Text Teal Is Deep Rule.** Teal text is always Deep Teal; the lighter Action Teal is a fill, never a text colour on light grounds.

**The Night Is A Container Rule.** Night blue holds the machine at work inside a rounded panel, tile or the footer. It is never a section ground.

## Typography

**Display Font:** Geologica (self-hosted variable 100–900, with Segoe UI, system-ui fallback)
**Body Font:** Geologica
**Label/Mono Font:** Geologica with tabular numerals

**Character:** A single geometric-humanist sans with Cyrillic and Latin coverage, used heavy and tight at size for a confident, plain-spoken voice, and at a light 380 for long reading.

### Hierarchy
- **Display** (760, clamp 42–76px, 0.98, -0.035em): the hero h1 and the footer email address. Phone: clamp(36px, 10vw, 46px) for the h1, 30px for the footer email.
- **Headline** (720, clamp 32–54px, 1.02, -0.03em): section h2s; also the Calm Ops panel title, ladder prices and the flow result figure (740).
- **Figure** (740, 40px, 1, -0.035em, tabular): proof numbers, case figures, calculator tiles; the belief quote uses the same 40px at 560 (24px on phone).
- **Title** (680, clamp 19–22px, 1.3, -0.015em): h3s, case names, segment names, photo-caption names, FAQ questions (640).
- **Lead** (380, clamp 19–22px, 1.45, max 56ch; hero 40ch): section intros in Slate Muted; hero lead in Ink.
- **Body** (380, 17px, 1.55; 16px on phone): running text, 58–66ch measures.
- **Label** (620, 14px): buttons in nav and inside devices, field labels, state pills, "try" tags, case "more" links. Sentence case; no uppercase tracking.

### Named Rules
**The Tabular Number Rule.** Every number that counts something (hours, złoty, percentages, times) is set with tabular figures.

**The One Face Rule.** Geologica carries every role; hierarchy comes from weight (380 to 760) and size, not from a second family.

## Layout

A centred frame of max 1360px with 32px side margins (20px at ≤760px, both widened by safe-area insets). Sections are 136px top and bottom (88px on phone) and alternate grounds to tell the story: archive paper with a faint colour light for problem sections, morning ground with stronger colour light for solution sections. Section heads are a grid of h2 and lead with an 18px gap, max 760px; the main block follows 48px below. Content grids are two-column asymmetric (for example 1.08fr / 0.92fr in the hero, 0.8fr / 1.2fr in the intro) with 28–64px gaps; repeated items use 8–12px gaps. The hero fills min(880px, viewport minus nav).

Breakpoints: at 1100px all two-column grids collapse to one column, nav links hide (the consultation button stays), the teams band stacks; at 760px type steps down, proofs and calculator tiles go single-column, the Calm Ops diagram hides, and the booking sheet becomes a bottom sheet.

## Elevation & Depth

Depth is material, not lift: translucent white glass with a 22px blur and 1.5 saturation over coloured light, separated by 1px hairlines. A single ambient shadow sits under glass panels, the night flow panel and the portrait; devices and sheets have their own heavier shadows. Nothing is flat-hard or offset.

### Shadow Vocabulary
- **Ambient glass** (`box-shadow: 0 24px 60px -34px rgba(19,32,42,.45)`): glass panels, tips, the flow panel, the portrait.
- **Device** (`box-shadow: 0 50px 90px -46px rgba(19,32,42,.7)` plus inset bezel rings): the iPhone mock only.
- **Sheet** (`box-shadow: -30px 0 80px -40px rgba(19,32,42,.55)`): the booking side sheet.

### Named Rules
**The Frosted Not Floating Rule.** A panel reads as glass because of blur, translucency and a hairline; the ambient shadow only grounds it. Never raise elevation on hover; hover changes border colour or fill.

## Shapes

Generously rounded, soft-cornered forms. Panels, cases, rungs, tiles and photos use 28px; insets inside panels (captions on photos, FAQ items, agenda) use 18px; inputs and flow nodes 14px; small photo captions 10px. Every control is a pill (999px): buttons, chips, tabs, state pills, "try" tags. Avatars are circles. The phone mock is a 58px device with a 47px screen. Dashed borders mean "not yet chosen" (unpicked tasks) or "placeholder" (example quote cards); solid means real or chosen.

## Components

### Buttons
Confident, soft, single-colour.
- **Shape:** full pill (999px), min-height 52px (42px in the nav and inside devices).
- **Primary:** Action Teal fill, white 17px/620 text, 12px 26px padding; often paired with a muted 14px note underneath (duration and price).
- **Hover / Focus:** fill shifts to Deep Teal over 0.2s on the expo-out ease; pointer press scales to 0.97 and springs back. Focus is a 3px Action Teal outline at 3px offset.
- **Ghost:** Glass Strong fill, ink text, hairline border; hover goes solid white.
- **Text link:** ink text with a 2px Action Teal underline at 5px offset; the secondary action next to every primary.

### Chips
- **Style:** Glass Strong pill, hairline border, 14px/500 ink, min-height 44px.
- **State:** hover borders in Action Teal; selected (pressed/checked) fills solid Ink with white text. Used for team size, booking days and times.

### Tabs
- **Style:** a segmented pill track (ink at 6%) holding 44px pill tabs at 17px/600; selected tab is Action Teal with white text; hover is 70% white.

### Cards / Containers
- **Corner Style:** 28px.
- **Background:** Glass (58%) with blur 22px saturate 1.5; Glass Strong for nested captions; Night for "machine" panels; solid Action Teal for the first ladder rung and the accent tile.
- **Shadow Strategy:** Ambient glass (see Elevation).
- **Border:** 1px hairline.
- **Internal Padding:** 28px (22px/18px on phone); disclosure rows 22px 26px.

### Inputs / Fields
- **Style:** solid white, hairline border, 14px radius, min-height 48px, 17px text; labels above at 14px/620 with a 6px gap.
- **Focus:** 2px Action Teal outline, border goes transparent.
- **Error:** Overdue Rust text at 14px/560 below the field.

### Navigation
- Sticky, 68px (60px on phone), morning-ground glass at 72% with the shared blur and a bottom hairline. Brand is a two-line name (720) and role (14px muted). Links are 14px ink, hover Action Teal; a compact pill consultation button always sits at the right and survives every breakpoint.

### Try Tag (signature)
A solid Action Teal pill (14px/620 white) with a small white dot that pings four times, pinned across the top edge of an interactive block (hero phone, builder, calculator, Calm Ops). It marks something as touchable. It appears only on interactive blocks, never as a label above a heading.

### Mykhailo's Tip (signature)
A 44px circular portrait beside a two-line hint (bold name line, 14px text) in a Glass Strong pill-card (22px radius). Inside an existing glass panel it drops its own fill and border.

### Glass Phone (signature)
A dark-bezel iPhone mock whose screen is lit by the teal, lilac and peach light. Its rows are frosted notification cards (18px radius, 66% white, blur 14px) that turn teal-washed when handed to the agent, or amber-washed when they stop at a Human Gate. The next tappable row carries a pulsing teal ring.

### Agent Flow (signature)
A Night panel listing steps as stacked 14px-radius nodes joined by 2px links: a light trigger node, dark steps, amber gate nodes, a teal result node; links light up in Sea Glass as the flow is built.

### Disclosure Rows
Cases and FAQ are native details elements styled as glass rows; the FAQ marker is a drawn Deep Teal plus that rotates 45 degrees into a cross on open.

## Do's and Don'ts

### Do:
- **Do** keep every archival photograph greyscale (`filter: grayscale(1) contrast(1.06)`); colour belongs to the present.
- **Do** alternate archive-paper sections for the problem and morning-ground sections for the answer.
- **Do** use Action Teal for one primary action per block and Deep Teal for any teal text.
- **Do** show the Human Gate in amber wherever a flow is drawn.
- **Do** mark every interactive block with the Try Tag and follow it with a clear next action (button or text link).
- **Do** set counts in tabular figures and animate them on the shared expo-out ease (cubic-bezier(.16,1,.3,1)), with reduced motion honoured.

### Don't:
- **Don't** use amber for anything that is not a person's decision.
- **Don't** make night blue a page or section ground; it lives inside rounded containers and the footer.
- **Don't** colourise or tint archival photos with the accent; the only colour over them is the soft veil and the hero's colour light.
- **Don't** add a second typeface or uppercase tracked labels.
- **Don't** use hard or offset shadows; depth is blur, translucency and one ambient shadow.
- **Don't** use robot or robot-replaces-human imagery.
