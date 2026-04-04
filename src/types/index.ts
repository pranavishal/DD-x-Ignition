export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export interface StoryScene {
  text: string;
  imageUrl: string;
  duration: number; // in milliseconds
}

export interface SafetyData {
  radonPciL: number;    // picocuries per liter (safe < 2, danger > 4)
  noiseDb: number;      // average decibels (quiet < 55, loud > 70)
  crimeIndex: number;   // 0–100 (0 = safe, 100 = dangerous)
  walkability: number;  // 0–100 (100 = most walkable)
}

export interface RentalData {
  avgPrice: number;       // $/month
  totalUnits: number;
  availableUnits: number;
  pricePerSqft: number;
  vacancyRate: number;    // percentage
}

export type HeatmapLayerId = "walkability" | "noise" | "crime" | "radon";

export interface HeatmapLayerConfig {
  id: HeatmapLayerId;
  label: string;
  enabled: boolean;
  colorScale: {
    low: string;
    high: string;
  };
}

export interface Building {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
    height: number;
  };
  yearBuilt: string;
  originalUse: string;
  currentUse: string;
  summary: string;
  timelineEvents: TimelineEvent[];
  images: string[];
  generatedStory: string;
  storyScenes: StoryScene[];
  audioUrl?: string;
  height?: number;
  safetyData?: SafetyData;
  rentalData?: RentalData;
}
