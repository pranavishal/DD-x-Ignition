export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export interface StoryScene {
  text: string;
  imageUrl: string;
  duration: number; // fallback in ms, used only when audioUrl is absent
  audioUrl?: string; // per-scene narration audio (data URI)
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
  audioUrl?: string; // Optional audio track for the story
}

export interface UniqueSpot {
  id: string;
  name: string;
  description: string;
  location: string;
  photoUrl: string;
  category: 'food' | 'art' | 'nature' | 'nightlife' | 'hidden-gem' | 'historic';
  coordinates: { lat: number; lng: number };
  likes: number;
  couponUnlocked: boolean;
  submittedAt: string;
}

export interface PulseFeedItem {
  id: string;
  type: 'event' | 'news' | 'social' | 'live-update';
  title: string;
  description: string;
  source: string;
  timestamp: string;
}
