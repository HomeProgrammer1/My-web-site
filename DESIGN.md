---
name: mlohaza.com
description: "Синя папка: an office desk seen from above, a tidy board of flat tiles with a few sheets put down slightly askew."
colors:
  paper: "#F2F4F8"
  sheet: "#FFFFFF"
  tone: "#E3E8F1"
  ink: "#0F1629"
  ink-deep: "#070B17"
  muted: "#454E68"
  cobalt: "#1C3FAE"
  cobalt-deep: "#132E86"
  cornflower: "#9DB0E6"
  sky: "#CAD6F4"
  sky-deep: "#B4C4EE"
  marker: "#FFD84D"
  marker-deep: "#F0C419"
  on-dark: "#FFFFFF"
  on-dark-soft: "#D6DEF8"
  sheet-hover: "#FBFCFE"
  on-dark-veil: "rgba(255,255,255,.08)"
  scrim: "rgba(15,22,41,.55)"
  screen: "#DCE3EE"
typography:
  display:
    fontFamily: "Geologica, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(30px, 5vw, 80px)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geologica, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(28px, 3.4vw, 54px)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Geologica, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(20px, 1.9vw, 28px)"
    fontWeight: 750
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geologica, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "tnum"
  label:
    fontFamily: "Geologica, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.45
rounded:
  none: "0px"
spacing:
  gap: "8px"
  gap-phone: "6px"
  margin: "16px"
  pad: "clamp(20px, 1.7vw, 28px)"
  section: "clamp(96px, 9vw, 128px)"
components:
  button-primary:
    backgroundColor: "{colors.marker}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "12px 22px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.marker-deep}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.none}"
    padding: "12px 22px"
  button-ink-hover:
    backgroundColor: "{colors.ink-deep}"
  tile:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "{spacing.pad}"
  tile-link:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.none}"
    height: "64px"
  tile-link-hover:
    backgroundColor: "{colors.cobalt-deep}"
  nav-item:
    backgroundColor: "{colors.tone}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 18px"
    height: "64px"
  nav-item-hover:
    backgroundColor: "{colors.sky}"
  nav-item-current:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.on-dark}"
  chip:
    backgroundColor: "{colors.tone}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "10px 14px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.marker}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 14px"
    height: "48px"
---

# Design System: mlohaza.com

## Overview

**Creative North Star: "The Well-Kept Desk"**

An office desk seen from above. Every page is a board of flat, square-cornered tiles on a strict 12-column grid; the 8px gaps between them are the only lines on the page. A few sheets on the board lie slightly off the grid, as if put down by hand (rotations of about ±0.4° to ±2.1°, offsets of a few pixels). When the visitor hands a task to the agent or makes a choice, that sheet squares up into the grid. Decisions that stay with a person are marked in marker yellow: the action, and the Human Gate.

The palette is the owner's «Синя папка» (blue folder): cool paper, white sheets, ink, one cobalt, two pale blues and one yellow marker. There is no red anywhere: no alarm states, no red errors. Geologica is the only face. Archival photographs are black-and-white pictures of manual office work; colour belongs to the present. The world refuses glass, gradients, blur, the dark AI-SaaS page, checkbox UI and red alarm states.

**Key Characteristics:**
- Flat filled tiles on a 12-column board, 8px gaps (6px on phones), 16px outer margin.
- Radius 0, no shadows at rest, no hairlines or borders between tiles.
- Controlled chaos: `.askew` sheets lie off the grid and square up when pressed or checked.
- Selection is a yellow highlighter stroke behind the words, or a marker-yellow fill; never a checkbox.
- One typeface (Geologica), five sizes, heavy display at -0.04em.
- B/W archival manual-work photos and Mykhailo's portrait, never captioned on the image.

## Colors

A cool office-folder palette: blues for the system, one warm yellow for what a person decides.

### Primary
- **Folder Cobalt** (#1C3FAE): link tiles (`.t-link`), the current nav item, the «90%» block on the portrait, slider thumbs, the FAQ plus mark, focus outline, cobalt tiles and segments. Hover goes to **Deep Cobalt** (#132E86).

### Secondary
- **Marker Yellow** (#FFD84D): the primary action (`.btn`, `.t-act`, `.nav__act`, the action row), the Human Gate step in every flow, selected chips, the highlighter stroke, and the form error note. Hover and the first rung's button use **Deep Marker** (#F0C419).

### Tertiary
- **Sky** (#CAD6F4): the hours-sum tile, a selected task, an open FAQ item, the flow's end node and connector bars, the agenda list, the visitor's own Telegram bubble, nav hover. **Deep Sky** (#B4C4EE) is the second rung's button.
- **Cornflower** (#9DB0E6): occasional tiles and one Calm Ops panel; in the calculator chart it marks months 1–3 (the payback quarter) against cobalt for months 4–12.

### Neutral
- **Desk Paper** (#F2F4F8): the page ground and the booking sheet ground; input fill.
- **Sheet White** (#FFFFFF): the default tile, slips, task cards, FAQ items.
- **Tone** (#E3E8F1): one step darker than the desk; nav items, facts, chips at rest, photo placeholders, input border, slider track.
- **Ink** (#0F1629): all text on light grounds; ink tiles, ink segments, the footer mark blocks. **Deep Ink** (#070B17) is its hover and the fourth rung's button.
- **Muted** (#454E68): hints, hour labels, secondary lines.
- **On-dark** (#FFFFFF) and **On-dark Soft** (#D6DEF8): text on cobalt and ink tiles.

### Named Rules
**The Marker Is a Decision Rule.** Marker yellow means a person acts or decides: the booking action, the Human Gate, a chosen option. It is never decoration.

**The No Red Rule.** There is no red in the system. The form error is a marker-yellow note with ink text.

## Typography

**Display Font:** Geologica (variable, self-hosted woff2, with Segoe UI, system-ui fallback)
**Body Font:** Geologica

**Character:** One grotesque carries everything; hierarchy comes from five sizes set far apart and from weight (400 to 800), not from a second family. Body text uses tabular figures site-wide.

### Hierarchy
- **Display** (800, `--t1` clamp(34px, 6.2vw, 104px), 0.96, -0.04em): the page h1 and case figures.
- **Headline** (800, `--t2` clamp(28px, 3.4vw, 54px), 1, -0.04em): h2, big figures (`.figure`), prices, the «90%» block, the footer mark letters.
- **Title** (750, `--t3` clamp(20px, 1.9vw, 28px), 1.3, -0.02em): h3, tile titles, the belief quote, lead paragraphs (400, 1.35).
- **Body** (400, `--t4` 17px, 1.55): running text, max 62ch.
- **Label** (400–600, `--t5` 14px, 1.45): hints, hour tags, fact terms, chip text, notes.

### Named Rules
**The Five Sizes Rule.** Only `--t1`…`--t5` exist. Do not add an in-between size; the only literal sizes are inside the Telegram phone fragment and the chart (13–15px).

## Layout

The board: `.board` is `grid-template-columns: repeat(12, minmax(0, 1fr))` with `gap: var(--gap)` (8px) and 16px inline padding (`--m`), the same margin everywhere. Tiles are filled blocks placed by column spans; sections are separate boards spaced by `--sec` (clamp(96px, 9vw, 128px)). Tile padding is `--pad` (clamp(20px, 1.7vw, 28px)). The nav is the top row of the board: brand, four links and a yellow action tile, each a 64px filled cell.

The home page is short: problem hero, who I am, team builder, calculator, a stepped ladder of four tiles rising 360/440/520/600px. Cases, Calm Ops, Human Gate, Telegram 8:00 and FAQ live on `pro-mene.html` and `yak-pracyuyu.html`, which open with a page band (h1 plus optional portrait tile).

Breakpoints: at 1100px spans are re-laid on the same 12 columns (nav becomes 4 columns, ladder becomes 2×2). At 760px the board collapses to 2 columns with every tile full width, `--gap` 6px and `--pad` 20px; the hero shows the slips first and the photo last.

## Elevation & Depth

Flat. No `box-shadow` exists in the stylesheet. Depth is read from fill steps (paper, tone, sheet, sky, cobalt, ink) and from the small rotation of askew sheets. The only translucency is the booking dialog backdrop (ink at 55%) and the 8% white step for flow nodes on ink tiles.

### Named Rules
**The Flat Desk Rule.** Nothing floats at rest and nothing lifts on hover; hover changes the fill one step (tone to sky, marker to marker-deep, cobalt to cobalt-deep).

## Shapes

Square corners everywhere (radius 0) on tiles, buttons, chips, inputs, slider thumbs and the dialog. No borders between tiles; the gap is the line. The only stroke is the 2px tone border on inputs (cobalt on focus). The one sanctioned overlay on a photo is the cobalt «90%» block on Mykhailo's portrait, which hangs half off the photo's top edge (bottom edge on phones).

The Telegram phone on `yak-pracyuyu.html` is a depiction of a real interface and keeps that interface's rounded frame, bubbles and round avatar; it is an exhibit, not a pattern for site UI.

## Components

### Buttons
- **Shape:** square (0), min-height 52px, padding 12px 22px, weight 700.
- **Primary:** marker yellow with ink text; hover marker-deep. Focus is a 3px cobalt outline at 3px offset (marker outline on dark tiles and on `.t-act`).
- **Ink:** ink with white text, hover deep ink; used inside the yellow action row.
- **Text link:** underlined 2px at 4px offset, weight 650; underline turns cobalt on hover.
- **Press:** Motion `press` scales buttons, slips, segments, tasks, chips and tiles to 0.97, then springs back (stiffness 520, damping 30).

### Action and link tiles
- **`.t-act`:** a whole marker-yellow tile as the booking action: title at `--t3`, a `--t5` line with «30 хвилин, 190 zł».
- **`.t-link`:** a 64px cobalt tile with a single bold line, linking deeper (calculator, story page).
- **Rungs:** four plan tiles in marker, sky, cobalt, ink; each ends in a full-bleed 64px button one step deeper in the same hue.

### Chips
- **Style:** tone fill, ink `--t5` 600 text, 44px min-height, square.
- **State:** hover sky; selected (`aria-pressed` or `aria-checked`) marker yellow. Used for calculator processes and booking-form radios (who, pain, day, time).

### Cards / Containers
- **Tiles:** sheet white by default; `--tone`, `--sky`, `--cornflower`, `--cobalt`, `--ink`, `--marker` variants. Padding `--pad`, no border, no shadow, radius 0.
- **Photo tiles:** padding 0, image `object-fit: cover` with a per-tile `object-position`; no caption, label or stamp on the image. Photos are the B/W archival 1959 New Zealand Railways typists room and the 1937 Baltimore Social Security records office, plus crops of Mykhailo's portrait. Credits sit in the footer.

### Inputs / Fields
- **Style:** paper fill, 2px tone border, radius 0, 48px min-height; label above at 650.
- **Focus:** border turns cobalt, no glow.
- **Error:** a marker-yellow note with ink text above the submit; never red.
- **Range:** 8px tone track, 26px square cobalt thumb.

### Navigation
The top row of the board: tone cells (64px), sheet-white brand cell with name and a muted line, cobalt for the current page, a marker action cell «Записатися 190 zł». Hover tone to sky. At 760px: brand and action on one row, inner links below at 48px, in-page anchors hidden.

### Askew sheets (signature)
`.askew` takes inline `--r`, `--dx`, `--dy` and applies them through `rotate` and `translate`. When `.is-square`, `aria-pressed="true"` or `aria-checked="true"`, it returns to `rotate: 0` and `translate: 0` over .55s on the settle ease `cubic-bezier(.34,1.42,.64,1)`. Used on hero slips, team segments, builder tasks (the JS sets their lie), the belief quote, single calculator and case tiles, and the Human Gate examples.

### Highlighter selection (signature)
`.slip__t::before` and `.hl::before` draw a marker-yellow block behind the words, rotated -0.7°, that grows from `scaleX(0)` to `scaleX(1)` over .45s on `cubic-bezier(.16,1,.3,1)`. This is how a slip or a team segment shows it is chosen; `.hl.is-on` shows a decided state statically.

### Builder and flow
Tasks are white askew cards (name, hours, state line); a pressed task fills sky, a pressed gate task fills marker. The flow on an ink tile is a column of nodes on an 8% white step joined by 6px sky bars; the Human Gate node is marker with ink text, the end node is sky.

### Booking sheet
A native `<dialog>` 560px wide pinned to the right edge, full height, paper ground with an ink 55% backdrop; on phones it becomes a 92svh bottom sheet. It slides in from the right (from the bottom on phones) over .45s. Inside: a white head with a square portrait crop and a square close button, a sky numbered agenda, the white form, then a confirmation with the composed request.

### Motion
Motion 12 (vanilla build) is vendored; everything is skipped under `prefers-reduced-motion`. On load the hero slips land (fall from -26px with extra rotation, 0.7s, 70ms stagger); inner pages deal their first sheets (from -18px and ±0.8°, 60ms stagger). Loose askew sheets land when they enter view. The Human Gate flow runs once, left to right, with the gate node pulsing to scale 1.04. The Telegram messages arrive in sequence (250ms stagger). Counters tween over .45s. There are no scroll fade-ins on content and no marquee.

## Do's and Don'ts

### Do:
- **Do** place every block as a filled tile on the 12-column board with the 8px gap as the only separator.
- **Do** keep askew offsets small (under about 2.1° and 10px) and square the sheet up when the visitor decides.
- **Do** use marker yellow for the booking action and the Human Gate wherever a flow is drawn.
- **Do** show choices with the highlighter stroke or a marker fill.
- **Do** keep archival photos black-and-white images of manual work, and keep every photo free of captions, labels and stamps.
- **Do** open booking in the right-side dialog sheet (bottom sheet on phones) from every `data-book` action.

### Don't:
- **Don't** use red, for errors or anything else.
- **Don't** use checkboxes, check marks or coloured side bars to show selection.
- **Don't** round corners, add shadows, borders between tiles, hairlines, glass, blur or gradients.
- **Don't** add a second typeface or a size outside `--t1`…`--t5`.
- **Don't** put any overlay on a photo other than the cobalt «90%» block on the portrait.
- **Don't** add scroll fade-ins or a marquee; motion is limited to landing, dealing, the gate flow, the message sequence and press feedback.
- **Don't** use robot or robot-replaces-human imagery.


## v3.1 additions (24.10.2026)
- **Calmer scale.** `--t1` is now clamp(30px, 5vw, 80px), `--t2` clamp(26px, 2.9vw, 44px), tile padding clamp(22px, 2.2vw, 36px), section gap clamp(96px, 10vw, 152px). Fewer tiles per section; text often sits on the paper ground instead of in a tile.
- **Navigation.** A plain sticky bar (brand, five text links including FAQ, one yellow button) that hides while scrolling down and returns on scroll up; under 900px the links open from a «Меню» button as a floating panel.
- **Floating booking button.** `.fab`, fixed bottom-right on every page, yellow with `--float-shadow` (it floats, so the shadow is allowed and marked for the linter).
- **Hero canvas.** `#blueprint` draws a cobalt grid and an automation schema (Excel, AI-агент, CRM, Звіт, Telegram, a yellow Human Gate node) that a cursor spotlight reveals; it fades out under the copy, moves on its own when there is no pointer, pauses off-screen and draws one still frame under reduced motion.
- **Problem block.** A real spreadsheet fragment (`.xl`, `data-ui`) with cells highlighted in marker yellow the way people mark Excel by hand.
- **Calculator bars.** HTML bars (`.bars i`) measured against one scale that changes only in round steps, so they grow and shrink with the sliders; a 3px ink line marks the 3-month sum.
- **Excel → CRM demo.** `.merge` on the method page plays once when scrolled into view: rows leave the sheet, the AI agent normalises them, one rejection letter waits at the yellow Human Gate, cards fill the CRM; a replay button follows, and reduced motion shows the final state.

## v3.2 additions (24.10.2026)
- **Story.** The site now argues: the processes already exist in people's heads; Mykhailo finds them, draws them on one schema and automates them (Знаходжу, Візуалізую, Автоматизую). No archival photographs remain; the only photographs are his portrait crops.
- **Process composer** (`.cp`, `data-ui`): five askew cards in a pile, the next one outlined in cobalt with an animated pointer hint (stops after the first correct click and under reduced motion); clicked cards move (FLIP) into five paper slots, cobalt 4px connectors grow between filled slots, owners appear; «Автоматизувати» turns four cards sky (agent) and one marker yellow (Human Gate). Phase words are marked with the highlighter.
- **Calculator.** Four inputs, each a slider plus a number field: hours per week, hourly cost, share for agents, implementation budget. Bars show cumulative savings on one scale; bars up to the payback month are cornflower, later ones cobalt; a 3px ink line with a white label marks the budget.
- **Method panels.** The open panel puts its text right under the name and a small picture of the deliverable on the right (process map, flow with a yellow gate, checklist, before/after bars).
- **Cases.** Each case is a row: a coloured chart tile (`data-ui`) and a story tile with «Було, Зробили, Результат» under short cobalt bars (yellow for the result).
- **Footer.** The block wordmark is gone.

## v3.3 additions (24.10.2026)
- **Process demo.** Cards carry the manual minutes, then a system chip (`.cp-sys`: Gmail, HubSpot, Fakturownia, Google Sheets, Telegram). «Автоматизувати» sends an ink token («Заявка») card to card; the running card gets a 3px ink outline, connectors behind the token turn marker yellow, and the invoice card stops as a yellow Human Gate before it is approved. «Запустити ще одну заявку» replays it.
- **Method.** Six tinted panels from ink to sky (ink, cobalt-deep, cobalt, `--periwinkle` #6F88D6, cornflower, sky): Слухаю, Візуалізую, Налагоджую, Автоматизую, Навчаю, Звітую.
- **LinkedIn card** (`.li-card`): a cobalt tile linking to the profile; its three topic slips lie askew and square up on hover or focus.
- **Legal pages** (`.doc`): one white column on the board, a yellow draft note, headings at `--t3`, text capped at 60ch.
- **Page top.** Without a hash every page scrolls itself to the top on load, so a link never lands mid-page.

## v3.4 additions (25.10.2026)
- **Three languages.** EN at the root, PL in `/pl/`, UA in `/ua/`, built from `src/` (`python3 src/build.py`); one `styles.css` and one language-free `main.js` serve all of them, strings come from `lang/<code>.js`. Layout and tokens are unchanged across languages.
- **Language switch** (`.langs`): three 40px text links EN · PL · UA in the nav after FAQ and once more in the footer row; the current language sits on a `--tone` chip, the others are `--muted` until hover. In the phone menu they become a row of 52×46px targets.
- **Nav widths.** The brand tagline hides under 1280px, links never wrap, and the links fold into «Меню» under 1060px (it was 900px), so the longest language still fits on one line.
- **Hero motto.** The headline is the motto, set as two `.ln` spans that break after the comma; `--fit` (11.2em, 12.4em for Ukrainian) caps the size, so the motto never takes a third line on a phone. Non-breaking spaces keep the Ukrainian dashes off line starts.
- **Method bars.** On the three dark panels (ink, cobalt-deep, cobalt) the «before» bar is sky; the «after» bar stays marker yellow.
- **Experience tiles** are all square now; «Від 2024» no longer lies askew.
- **Legal measure** is 36em instead of 60ch, because Latin text packs many more letters into a `ch` than Cyrillic.

## v3.7 additions (30.10.2026)
- **Stats** in «Hi, I'm Mykhailo» are four (adds 2.5 years in pharma) and sit as a 2×2 grid at desktop and tablet, one column on phones.
- **Rules** are plain paragraphs; the bold lead-in on each rule is gone, so `.rules li b` was removed.

## v3.8 additions (30.10.2026)
- **Brand tagline** never wraps and hides under 1400px, so the longer Ukrainian nav item («Як це працює») still fits on one line.
- **Method step names** are descriptive nouns or short actions in every language; they run vertically on closed panels and fit up to about 20 characters.
