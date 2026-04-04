# Project Progress — Guidebook MVP

## Overview
An interactive 3D city exploration app where users search for any location, click buildings on a 3D map, and receive AI-generated historical narratives with images and voiceover.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · CesiumJS 1.140 · OpenAI SDK · Google Maps APIs · Framer Motion

---

## Pages

| Page | File | Status |
|------|------|--------|
| Landing / Search | `src/components/ui/LandingPage.tsx` | Done |
| 3D Map Exploration | `src/app/page.tsx` | Done |

---

## Components

### Map
- **CesiumScene** (`src/components/map/CesiumScene.tsx`)
  - 3D globe with CesiumJS + Cesium Ion
  - OpenStreetMap buildings (3D tileset)
  - CartoDB Light basemap
  - Click handler extracts building metadata (name, type, height) from clicked tiles

### UI
- **LandingPage** (`src/components/ui/LandingPage.tsx`)
  - Google Places Autocomplete search with debounce
  - Animated dropdown predictions
  - Geocoding on selection → navigates to map view
  - Hero design with gradient text and ambient glow

- **Panel** (`src/components/ui/Panel.tsx`)
  - Slide-out right panel on building click
  - Displays: name, address, year built, original use, timeline events
  - "Generate Story" button with animated loading steps
  - Calls `/api/generate-story` and opens StoryModal on completion

- **StoryModal** (`src/components/ui/StoryModal.tsx`)
  - Full-screen modal overlay
  - Animated entrance/exit (Framer Motion)
  - Wraps StoryPlayer

### Features
- **StoryPlayer** (`src/components/features/StoryPlayer.tsx`)
  - Sequential scene playback (image + text overlay)
  - Auto-advances with configurable per-scene duration
  - Audio narration with mute toggle
  - Progress bar, replay button

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/autocomplete` | GET | Google Places Autocomplete — returns location predictions for query `?q=` |
| `/api/geocode` | GET | Google Places FindPlace — converts `?address=` to `{ lat, lng }` |
| `/api/generate-story` | POST | Full AI story pipeline (see below) |

### `/api/generate-story` Pipeline
1. **Script** — GPT-4o-mini generates a 3-part historical narrative for the building
2. **Modern photo** — Google Street View Static API fetches a current photo
3. **Historical images** — DALL-E 3 generates 2 period-accurate illustrations
4. **Voiceover** — OpenAI TTS (`tts-1`, voice: `onyx`) produces audio narration
5. Returns `{ storyScenes: StoryScene[], audioUrl?: string }`

---

## Types (`src/types/index.ts`)

```ts
Building        — id, name, address, coordinates, yearBuilt, originalUse, currentUse,
                  summary, timelineEvents, images, generatedStory, storyScenes, audioUrl
StoryScene      — text, imageUrl, duration (ms)
TimelineEvent   — year, title, description
```

---

## Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Autocomplete, Geocoding, Street View |
| `OPENAI_API_KEY` | GPT-4o-mini, DALL-E 3, TTS |
| `CESIUM_ION_TOKEN` | CesiumJS 3D tiles (currently hardcoded in CesiumScene.tsx) |

---

## Not Yet Built

- [ ] Database / persistence (app is fully stateless — no history saved)
- [ ] User authentication
- [ ] `Heat/` directory — placeholder only (README: "First Push")
- [ ] Tests (no test files exist)
- [ ] Error boundary / fallback UI for failed story generation
- [ ] Mobile layout optimization
