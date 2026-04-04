import { UserProfile } from "@/types";

export const mockProfiles: UserProfile[] = [
  {
    id: "prof-1",
    username: "@rooftop_rover",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80",
    bio: "Finding the best views one rooftop at a time",
    spotsCount: 23,
  },
  {
    id: "prof-2",
    username: "@alley_gourmet",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    bio: "If it's hidden and delicious, I've been there",
    spotsCount: 41,
  },
  {
    id: "prof-3",
    username: "@neon_nomad",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
    bio: "Chasing city lights and street art",
    spotsCount: 17,
  },
  {
    id: "prof-4",
    username: "@vinyl_vagabond",
    avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=80&q=80",
    bio: "Record stores, dive bars, and late-night jazz",
    spotsCount: 34,
  },
  {
    id: "prof-5",
    username: "@history_hiker",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80",
    bio: "Every old building has a secret",
    spotsCount: 56,
  },
  {
    id: "prof-6",
    username: "@urban_forager",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80",
    bio: "Street food, farmers markets, hidden gardens",
    spotsCount: 29,
  },
  {
    id: "prof-7",
    username: "@midnight_walker",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
    bio: "The city is different after dark",
    spotsCount: 12,
  },
  {
    id: "prof-8",
    username: "@café_cartographer",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
    bio: "Mapping every great coffee spot on earth",
    spotsCount: 67,
  },
];

export const YOU_PROFILE: UserProfile = {
  id: "you",
  username: "You",
  avatarUrl: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=80&q=80",
  bio: "Explorer",
  spotsCount: 1,
};

export function getRandomProfile(): UserProfile {
  return mockProfiles[Math.floor(Math.random() * mockProfiles.length)];
}

export function getProfileById(id: string): UserProfile | undefined {
  if (id === "you") return YOU_PROFILE;
  return mockProfiles.find((p) => p.id === id);
}
