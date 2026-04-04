import { PulseFeedItem } from "@/types";

export function getStaticFeedItems(cityName: string): PulseFeedItem[] {
  return [
    {
      id: "feed-1",
      type: "event",
      title: "Rooftop Jazz & Wine Night",
      description: `Live jazz quartet with wine tasting at The Heights. Doors open 7pm, ${cityName} locals get free entry.`,
      source: "Luma",
      timestamp: "2h ago",
    },
    {
      id: "feed-2",
      type: "news",
      title: "New Protected Bike Lane Opens Downtown",
      description: `${cityName}'s longest protected bike lane is now open, connecting the waterfront to central park in a 4-mile stretch.`,
      source: "Local Times",
      timestamp: "4h ago",
    },
    {
      id: "feed-3",
      type: "social",
      title: "Best croissant I've ever had",
      description: "Just discovered this tiny bakery on 5th — the almond croissant is unreal. Line was only 5 minutes!",
      source: "@wanderlust_eats",
      timestamp: "1h ago",
    },
    {
      id: "feed-4",
      type: "live-update",
      title: "Street Performance in Progress",
      description: "Incredible violin duo performing at the central plaza right now. Small crowd gathering.",
      source: "Live",
      timestamp: "12m ago",
    },
    {
      id: "feed-5",
      type: "event",
      title: "Saturday Morning Farmers Market",
      description: `Weekly farmers market with 40+ local vendors. Fresh produce, artisan bread, and live acoustic sets. ${cityName} Community Center.`,
      source: "Luma",
      timestamp: "6h ago",
    },
    {
      id: "feed-6",
      type: "news",
      title: "Historic Theater Reopens After Renovation",
      description: `The landmark Grand Theater has reopened after 18 months. First show is a sold-out comedy night this Friday.`,
      source: "City Gazette",
      timestamp: "8h ago",
    },
    {
      id: "feed-7",
      type: "social",
      title: "Sunset from the hidden park was magical",
      description: "If you haven't checked out the fountain park between those two towers on Main St, you're missing out. Golden hour there hits different.",
      source: "@city_explorer",
      timestamp: "3h ago",
    },
    {
      id: "feed-8",
      type: "live-update",
      title: "Food Truck Rally at Pier 12",
      description: "15+ food trucks parked along the pier tonight. Tacos, ramen, BBQ — the works. Happening until midnight.",
      source: "Live",
      timestamp: "28m ago",
    },
  ];
}
