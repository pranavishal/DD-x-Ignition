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
