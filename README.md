# Guidebook MVP — AI + 3D Map Smart Guide (DD × Ignition)

An AI-powered, map-first guide that helps people explore places with confidence.
Tell it what you’re into, how much time you have, and where you are — it builds a personalized plan and shows it on an interactive 3D map.

> Built for the **DD × Ignition Hackathon**.

---

## Why this exists

Planning is friction:
- Too many tabs (maps, blogs, reviews, notes)
- Generic “Top 10” lists that ignore your preferences
- Hard to translate recommendations into an actual route

**Guidebook** makes exploration feel like a guided experience:
**ask → get recommendations → see them on the map → go.**

---

## What it does (MVP)

- **Conversational discovery**: describe what you want in plain language
- **Personalized recommendations**: tuned to time, interests, and constraints
- **Map-first experience**: visualize places & routes directly in a 3D/interactive map
- **Fast iteration UI**: smooth motion + clean components for demo-ready storytelling

---

## Demo flow (suggested for presentations)

1. Pick a context: *campus / city / event / travel area*
2. Ask:  
   - “I have 2 hours, I like coffee + bookstores, keep it walkable.”  
   - “Show me 3 must-see spots near me and a short route.”
3. Watch the assistant generate a plan
4. See locations highlighted on the map
5. Adjust: “Make it cheaper”, “Less walking”, “Add one scenic stop”

---

## Tech stack

- **Next.js** (App Router)
- **TypeScript**
- **Cesium** (3D geospatial map)
- **OpenAI SDK** (AI assistant)
- **Tailwind CSS**
- **Framer Motion**
- **Lucide Icons**

---

## Getting started

### Prerequisites
- Node.js (recommended: latest LTS)
- npm / pnpm / yarn / bun

### Install
```bash
npm install
```

### Run dev server
```bash
npm run dev
```

Open: http://localhost:3000

---

## Environment variables

Create a `.env.local` file:

```bash
OPENAI_API_KEY=your_key_here
```

> If you add map providers, routing APIs, or places datasets later, document them here as well.

---

## Project structure (typical Next.js)

- `app/` — routes, pages, layouts
- `components/` — UI building blocks
- `lib/` — helpers (AI, map utilities, data fetching)

*(Update this section to match the actual repo folders once finalized.)*

---

## Roadmap ideas (post-MVP)

- Live location + “re-route me”
- Group mode: align everyone’s preferences
- Budget/time sliders
- Offline “saved itinerary”
- Places ingestion: curated datasets or partner APIs
- Shareable link to an itinerary

---

## Team

Built by the DD × Ignition team.

---

## License

Hackathon prototype — add a license if you plan to open-source.
