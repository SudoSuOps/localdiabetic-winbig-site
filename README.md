# localdiabetic-winbig-site

The full marketing site for **localdiabetic.com** — warm, local-first, private-by-default. One house with the **Win big.** message, sibling-tight across every page.

> Win big — every day, not someday. 🐝

## Deploy

Static site, no build step. Wire this repo to **Cloudflare Pages** (build command: none; output directory: repo root). Every page is plain HTML with inline styles + an inline bee sprite — works offline, paints instantly.

## Structure

```
index.html            Home — hero, the LifeBoard, foot care, the Bee, DailyShorts, founder "Why I built this", join
about/index.html      About Donovan — the founder story, Free · Private · A hand, CTA
dailylocal/index.html The DailyLocal — notebook index: featured issue + 10 issues + "Ask your Bee" voice panel
try/index.html        Ask Bee — live chat UI wired to the 27B diabetic model (POST /api/bee)
join/index.html       Join — email-only signup (POST /api/subscribe)
media/                DailyShorts videos (.mp4) + win-big-poster.png
```

Every page carries the same sticky header (the **LocalDiabetic / Win big.** stacked lockup) and footer.

## Backend routes the pages expect

- **`POST /api/subscribe`** — body `{ email, company }` (`company` is a honeypot; ignore if filled). Used by the home newsletter, the DailyLocal subscribe box, and `/join`. Return `{ ok: true }` on success or `{ ok: false, error: "…" }`.
- **`POST /api/contact`** — body `{ name, email, topic, message, company }`. Used by the home "Join the first members" form.
- **`POST /api/bee`** — body `{ message, history: [{role, content}, …] }`. Wire to the **27B diabetic model**. Return `{ reply: "…" }` (the chat also accepts `text` / `message` / `response`). Until wired, the chat shows a graceful "couldn't reach the hive" fallback.

## Brand

- **Type:** Inter (400–900) + JetBrains Mono (labels, receipts).
- **Color:** paper `#FBF7EF` · cocoa `#2B2118` · honey `#F2B441` · deep honey `#D99A2B` · dark ink `#0B0F14` · ink white `#E8EEF5` · green `#2FB67A`.
- **Lockup:** "Local" cocoa + "Diabetic" deep-honey; beneath it **"Win"** cocoa + **"big."** honey — the period stays.
- **Voice:** warm, plain-spoken, dignified. Educates, never diagnoses.

© 2026 Swarm and Bee LLC · build@localdiabetic.com · Jupiter, Florida
