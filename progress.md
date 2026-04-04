# Project Progress — Guidebook MVP

## Overview
An interactive 3D city exploration app where users search for any location, click buildings on a 3D map, and receive AI-generated historical narratives with images, voiceover, and live safety/rental overlays.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · CesiumJS 1.140 · OpenAI SDK · Google Maps APIs · Framer Motion

---

## Pages

| Page | File | Status |
|------|------|--------|
| Landing / Search | `src/components/ui/LandingPage.tsx` | Done |
| 3D Map Exploration | `src/app/page.tsx` | Done — now hosts tab system |

---

## Components

### Map
- **CesiumScene** (`src/components/map/CesiumScene.tsx`)
  - 3D globe with CesiumJS + Cesium Ion
  - OpenStreetMap buildings (3D tileset)
  - CartoDB Dark basemap
  - Click handler: extracts building metadata, looks up mock data, zooms + orbits camera
  - Dispatches `building-selected` / `building-deselected` events for cross-engineer use
  - Exposes `window.__cesiumViewer` for Engineers 2, 3, 4
  - Renders VastuPanel, SafetyToggle, and StoryModal as internal overlays

- **SafetyToggle** (`src/components/map/SafetyToggle.tsx`)
  - Floating "Safety X-Ray" button (bottom-left)
  - Expands to 4 animated toggle switches: Walkability, Noise, Crime, Radon
  - Each toggle adds/removes a Cesium `GroundPrimitive` heatmap layer

### Heatmaps (`src/components/map/heatmaps/`)
- **generateMockGeoJSON.ts** — Seeded 20×20 grid of GeoJSON polygons over Manhattan bounds
- **useHeatmapLayers.ts** — React hook managing all 4 Cesium `GroundPrimitive` colored overlays
  - Walkability: red → green
  - Noise: cyan → red
  - Crime: green → red
  - Radon: cyan → orange
- **index.ts** — Barrel export

### UI
- **LandingPage** (`src/components/ui/LandingPage.tsx`)
  - Google Places Autocomplete search with debounce
  - Animated dropdown predictions
  - Geocoding on selection → navigates to map view

- **TabNav** (`src/components/ui/TabNav.tsx`)
  - Fixed bottom navigation: Map / Journeys / Rentals / Pulse
  - Animated underline indicator (Framer Motion `layoutId`)
  - Map tab keeps Cesium mounted via `block`/`hidden` (no remount on tab switch)
  - Placeholder `#journeys-root`, `#rentals-root`, `#pulse-root` divs for Engineers 2–4

- **VastuPanel** (`src/components/ui/VastuPanel.tsx`) — replaces old Panel
  - Slide-in right panel with 3 truth tabs:
    - 💰 **Social** — avg rent, unit count, availability bar, price/sqft, vacancy rate
    - 👻 **Historical** — timeline events + AI ghost story (Generate button → StoryModal)
    - 🫁 **Physical** — radon, noise, walkability, crime index with animated risk bars
  - Falls back gracefully when mock data unavailable

- **StoryModal** (`src/components/ui/StoryModal.tsx`) — unchanged
- **Panel** (`src/components/ui/Panel.tsx`) — kept for reference, replaced by VastuPanel

### Features
- **StoryPlayer** (`src/components/features/StoryPlayer.tsx`)
  - Sequential scene playback (image + text overlay)
  - Audio narration with mute toggle
  - Progress bar, replay button

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/autocomplete` | GET | Google Places Autocomplete — returns location predictions for `?q=` |
| `/api/geocode` | GET | Google Places FindPlace — converts `?address=` to `{ lat, lng }` |
| `/api/generate-story` | POST | Full AI story pipeline (see below) |

### `/api/generate-story` Pipeline
1. **Script** — GPT-4o-mini generates a 3-part historical narrative
2. **Modern photo** — Google Street View Static API
3. **Historical images** — DALL-E 3 (×2)
4. **Voiceover** — OpenAI TTS (`tts-1`, voice: `onyx`)
5. Returns `{ storyScenes: StoryScene[], audioUrl?: string }`

---

## Data & Utilities

- **Mock Buildings** (`src/data/mock-buildings.ts`)
  - 20 real NYC landmarks with full `SafetyData` + `RentalData` + timeline events
  - `findNearestMockBuilding(lat, lng)` — proximity lookup (~200m threshold)
  - Buildings include: Empire State, Flatiron, Chrysler, 1WTC, Met Museum, 30 Rock, Woolworth, Grand Central, 432 Park, Chelsea Market, Vessel, 30 Hudson Yards, The Dakota, NYPL, MSG, 56 Leonard, Oculus, Steinway Hall, One Times Square, Brooklyn Bridge

- **Cesium Utils** (`src/lib/cesium-utils.ts`)
  - `zoomToBuilding(viewer, target, height)` — smooth 1.8s fly-to + starts orbit
  - `startOrbit(viewer, center, altitude)` — continuous slow camera orbit via `clock.onTick`
  - `stopOrbit()` — cancels active orbit (called on drag, empty click, or panel close)
  - `renderJourneyPath(viewer, geoJSON, color)` — **for Engineer 2** — draws glowing polyline
  - `addRentalBubble(viewer, position, count, onClick)` — **for Engineer 3** — canvas bubble marker

---

## Types (`src/types/index.ts`)

```ts
Building        — id, name, address, coordinates, yearBuilt, originalUse, currentUse,
                  summary, timelineEvents, images, generatedStory, storyScenes, audioUrl,
                  height?, safetyData?, rentalData?
StoryScene      — text, imageUrl, duration (ms)
TimelineEvent   — year, title, description
SafetyData      — radonPciL, noiseDb, crimeIndex, walkability
RentalData      — avgPrice, totalUnits, availableUnits, pricePerSqft, vacancyRate
HeatmapLayerId  — "walkability" | "noise" | "crime" | "radon"
HeatmapLayerConfig — id, label, enabled, colorScale
```

---

## Cross-Engineer Integration Contracts

| Contract | Owner | Consumer | How |
|----------|-------|----------|-----|
| `window.__cesiumViewer` | Eng 1 | Eng 2, 3, 4 | Global ref to Cesium Viewer |
| `building-selected` event | Eng 1 | Eng 4 | `window.dispatchEvent(CustomEvent)` with `{ building, coordinates }` |
| `building-deselected` event | Eng 1 | Eng 4 | `window.dispatchEvent(CustomEvent)` |
| `renderJourneyPath()` | Eng 1 | Eng 2 | Import from `@/lib/cesium-utils` |
| `addRentalBubble()` | Eng 1 | Eng 3 | Import from `@/lib/cesium-utils` |
| `#journeys-root` div | Eng 1 | Eng 2 | Mount point in `page.tsx` |
| `#rentals-root` div | Eng 1 | Eng 3 | Mount point in `page.tsx` |
| `#pulse-root` div | Eng 1 | Eng 4 | Mount point in `page.tsx` |

---

## Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Autocomplete, Geocoding, Street View |
| `OPENAI_API_KEY` | GPT-4o-mini, DALL-E 3, TTS |
| `CESIUM_ION_TOKEN` | CesiumJS 3D tiles (currently hardcoded in CesiumScene.tsx) |

---

## Not Yet Built

- [ ] Engineers 2, 3, 4 tabs (Journeys, Rentals, Pulse) — placeholder divs exist
- [ ] Database / persistence (app is fully stateless)
- [ ] User authentication
- [ ] `Heat/` directory — placeholder only
- [ ] Tests
- [ ] Move `CESIUM_ION_TOKEN` from hardcoded string to env var
