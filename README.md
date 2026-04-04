# URBAN MARBLE — AI-Powered Architectural Explorer (DD x Ignition)

The travel app for people who look up. Explore any city's architecture in 3D, scan real buildings with AR to uncover their history, find places to stay nearby, and discover hidden gems from the community.

> Built for the **DD x Ignition Hackathon**.

---

## Features

### 3D Globe Explorer — *Live*
Fly into any city on a full 3D CesiumJS globe with real building geometry. Search by city, landmark, or address and the camera takes you there.

### AR Building Scanner — *Live*
Point your camera at any building and tap **Scan**. GPT-4o Vision identifies the building using the image + your GPS coordinates and returns its name, year built, architectural style, architect, history, and a fun fact. Works on mobile and desktop webcam.

### Rental & Stay Aggregator (Map View) — *Live (Demo Data)*
165 clickable building clusters across NYC and Toronto showing 400 listings from Airbnb, Booking.com, Hotels.com, BambooHousing, Places4Students, Zillow, and Craigslist. Filter by type, source, price, stay length, and tags. Click a cluster to see all listings in that building with image carousels, ratings, and direct links. Currently uses curated demo data pinned to real buildings (The Plaza, Fairmont Royal York, Ritz-Carlton, etc.). Production version would integrate live listings via scraping pipelines and APIs.

### AI Journey Generator — *Live*
Generate a personalized cinematic experience of a city's architectural history and cultural landmarks, powered by AI storytelling.

### Wanderlust Community — *Live*
Users add hidden architectural gems. Places that get 50+ likes earn the poster a sponsor coupon. Community-sourced discoveries feed back into better journey recommendations.

---

## Demo Flow

1. **Land** — Globe spins, "Urban Marble" title with search bar
2. **Search** — Type "Toronto" or "New York" and fly into the city
3. **Explore** — Click buildings on the 3D globe for quick summaries
4. **AR Scan** — Hit the AR Scan button, point at a building, get its full architectural history
5. **Find a Stay** — Open Rentals, see 165 clusters packed across the city, filter by student housing / Airbnb / hotels
6. **Journey** — Watch an AI-generated cinematic tour of the city's architecture
7. **Community** — Browse hidden gems added by locals, add your own

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| 3D Map | CesiumJS + OSM Buildings |
| AI Vision | OpenAI GPT-4o (Vision API) |
| AI Stories | OpenAI GPT-4o |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm

### Install & Run
```bash
npm install
npm run dev
```

Open: http://localhost:3000

### Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
OPENAI_API_KEY=your_openai_key
```

### Testing AR on Mobile
```bash
npx next dev --experimental-https --hostname 0.0.0.0
```
Then open `https://<your-ip>:3000/rentals/ar` on your phone (same WiFi network).

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── rentals/
│   │   ├── page.tsx                # Map view with rental clusters
│   │   ├── ar/page.tsx             # AR building scanner
│   │   └── layout.tsx
│   └── api/
│       ├── vision/route.ts         # GPT-4o Vision API
│       ├── rentals/
│       │   ├── search/route.ts     # Rental search & filtering
│       │   └── listing/[id]/route.ts
│       ├── autocomplete/route.ts
│       └── geocode/route.ts
├── components/
│   ├── rentals/
│   │   ├── RentalsMap.tsx          # CesiumJS map with clusters
│   │   ├── FilterBar.tsx           # Search filters
│   │   ├── ListingCard.tsx         # Individual listing card
│   │   └── ListingPanel.tsx        # Slide-out listing panel
│   └── ui/
│       └── LandingPage.tsx         # Hero + search + globe
├── data/
│   └── mock-rentals.ts             # 400 listings across 165 real buildings
└── types/
    └── rentals.ts                  # TypeScript interfaces
```

---

## Roadmap (Post-Hackathon)

- **Live rental data** — Integrate Apify/SerpAPI scrapers for real-time Airbnb, Booking.com, and Zillow listings
- **Continuous AR scanning** — Real-time building detection without tap-to-scan
- **Walkability & safety heatmaps** — Overlay crime, noise, and walkability data on the map
- **Personalized journeys** — Tailor routes to dietary needs, accessibility, interests
- **Group mode** — Align preferences across multiple travelers
- **Offline itineraries** — Save and share journeys for offline use
- **Gamified community** — Leaderboards, badges, and sponsor integrations for Wanderlust contributors

---

## Team

Built by the DD x Ignition team.

---

## License

Hackathon prototype — add a license if you plan to open-source.
