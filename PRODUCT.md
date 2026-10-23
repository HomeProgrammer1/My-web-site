# Product

<!-- impeccable:product-schema 1 -->

Source: written from the owner's confirmed answers already in this repo (`docs/brief.md`, `docs/site-architecture.md`, `docs/content/site-content.md`, `docs/content/about-me.md`). The owner delegated the remaining choices ("вирішуй сам"); facts marked *inferred* were not confirmed in words.

## Platform

web

## Stack

delegated: static HTML/CSS/JS with no build step (same as the owner's other site, NetConnect), Motion (motion.dev, vanilla build) vendored for animation. Deploy target not chosen yet.

## Users

- Owners and managers of HR and recruiting agencies in Poland and the EU who lose hours to candidate handling, client reports and documents.
- Owners of small and mid-size companies, 5–200 people, whose requests, invoices and reports live in spreadsheets, mail and several systems.
- Sole proprietors (ФОП / JDG / self-employed), Poles and Ukrainians abroad, drowning in messengers, invoices and bookkeeping papers.

Low to medium technical literacy. They read on phone and laptop. IT companies are explicitly not the audience.

## Product Purpose

mlohaza.com is the personal site of Mykhailo Lohaza (Михайло Логаза), who automates routine work with n8n, Make, AI agents and RAG assistants. The site exists to turn a visitor into a booked paid consultation: 30 minutes, 190 zł (≈45 €, EN €45), credited toward implementation. Success is a booked consultation or a captured email from the calculator.

## Positioning

AI process automation without losing people or trust. Agents take the routine; every step that touches money or people stops at a **Human Gate** where a person approves. Method name: **Calm Ops** (working name). He does not take projects whose goal is cutting staff.

## Operating Context

- The client's Monday morning: inbox of applications, `kandydaci_FINAL_v3.xlsx`, overdue callbacks, invoices, a client asking for the report a second time.
- After: one Telegram message from the agent at 8:00 with buttons to approve or postpone.
- Works remotely from Poznań across Poland and the EU, in Polish, Ukrainian and English.
- Engagement ladder: consultation → process audit → pilot on one process → support. Only the consultation price is public.

## Capabilities and Constraints

- Only one price on the site: the consultation. Audit and implementation prices are named after the call (FAQ anchor "from about 2 000 zł" is still awaiting owner confirmation).
- Never use the words "скорочення", "FTE", "гарантую"; no robot-replaces-human imagery.
- Languages: PL default, `/ua/`, `/en/`. Review copy is Ukrainian.
- Booking is planned on Cal.com with Stripe; leads go to Telegram. Not wired yet.
- Contact email `kontakt@mlohaza.com` awaits confirmation.

## Brand Commitments

- Name: Mykhailo Lohaza / Михайло Логаза, domain mlohaza.com.
- Voice: «Прямо про інструменти, дбайливо з людьми.» Short sentences, concrete numbers, no hype, no AI scare stories.
- Line: «Рутину — агентам, рішення — людям.»
- His face leads the site: he is the guide through his own story.

## Evidence on Hand

- Portrait photo: `site/img/me.jpg` (from NetConnect `img/me.jpg`). The only real photo of him; more shots are needed.
- ERP rollout for 10 000+ users: 600–800k rows of HR and finance data moved without critical loss, 9–10 training sessions, 90% adoption, closed 1.5–2 months early, board report from 4–5 h to 5–10 min.
- Jira AI agent as Product Owner: −87% AI cost, 0% hallucinations on write operations, pilot of 10–15 people.
- HR agency CRM: five departments off Excel in one month.
- Content factory: one brief → 30 Instagram Stories, $0 API cost.
- AI hackathon: 2nd of 70+ teams.
- Testimonials: none real yet. Three placeholders exist and must be labelled «Приклад відгуку».
- Must not fabricate: client names, logos, reviews, press, guarantees.

## Product Principles

1. Routine to agents, decisions to people: the Human Gate is visible wherever a flow is shown.
2. Listen to the team first; automate what they themselves call routine.
3. Measure in returned hours and real usage, never in headcount.
4. Show, don't claim: numbers from real projects, demonstrations labelled as demonstrations.

## Accessibility & Inclusion

Readable on a phone by non-technical owners; WCAG AA contrast; every interactive works by keyboard and has a no-script reading.
