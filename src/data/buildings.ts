import { Building } from "../types";

export const buildings: Building[] = [
  {
    id: "empire-state",
    name: "Empire State Building",
    address: "20 W 34th St., New York, NY 10001",
    coordinates: {
      lat: 40.7484,
      lng: -73.9857,
      height: 400,
    },
    yearBuilt: "1931",
    originalUse: "Office Building",
    currentUse: "Office Building & Tourist Attraction",
    summary: "A 102-story Art Deco skyscraper in Midtown Manhattan, New York City.",
    timelineEvents: [
      {
        year: "1930",
        title: "Construction Begins",
        description: "Excavation of the site began on January 22, 1930.",
      },
      {
        year: "1931",
        title: "Opening",
        description: "President Herbert Hoover turned on the building's lights from Washington, D.C.",
      },
      {
        year: "1945",
        title: "B-25 Bomber Crash",
        description: "A B-25 Mitchell bomber crashed into the north side of the 79th floor.",
      },
    ],
    images: [],
    generatedStory: "Rising from the ashes of the Waldorf-Astoria Hotel, the Empire State Building became a symbol of American resilience during the Great Depression. Built in a record-breaking 410 days, it held the title of the world's tallest building for nearly 40 years. Imagine the dizzying heights the steelworkers navigated, tossing red-hot rivets hundreds of feet in the air without harnesses. Today, it stands not just as an office building, but as a beacon of New York's enduring ambition.",
    storyScenes: [
      {
        text: "Rising from the ashes of the Waldorf-Astoria Hotel, the Empire State Building became a symbol of American resilience during the Great Depression.",
        imageUrl: "https://images.unsplash.com/photo-1555109307-f7d9da25c244?auto=format&fit=crop&w=800&q=80",
        duration: 5000,
      },
      {
        text: "Built in a record-breaking 410 days, it held the title of the world's tallest building for nearly 40 years.",
        imageUrl: "https://images.unsplash.com/photo-1546436836-07a91091f11c?auto=format&fit=crop&w=800&q=80",
        duration: 5000,
      },
      {
        text: "Imagine the dizzying heights the steelworkers navigated, tossing red-hot rivets hundreds of feet in the air without harnesses.",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
        duration: 5000,
      },
      {
        text: "Today, it stands not just as an office building, but as a beacon of New York's enduring ambition.",
        imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
        duration: 5000,
      }
    ]
    // Removed the background music track as requested
  },
];
