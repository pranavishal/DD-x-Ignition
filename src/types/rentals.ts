export type RentalSource = 'airbnb' | 'booking' | 'hotels' | 'zillow' | 'craigslist' | 'bamboo' | 'places4students' | 'other';

export type RentalType = 'apartment' | 'room' | 'hotel' | 'hostel' | 'studio' | 'house';

export type StayLength = 'short' | 'medium' | 'long'; // night / week / month

export type PriceUnit = 'night' | 'week' | 'month';

export interface RentalListing {
  id: string;
  source: RentalSource;
  title: string;
  description: string;
  price: number;
  priceUnit: PriceUnit;
  currency: string;
  coordinates: { lat: number; lng: number };
  address: string;
  buildingName?: string;
  images: string[];
  amenities: string[];
  rating?: number;
  reviewCount?: number;
  listingUrl: string;
  type: RentalType;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  availableFrom?: string;
  availableTo?: string;
  tags: string[]; // e.g. "student-friendly", "furnished", "pet-friendly"
}

export interface BuildingCluster {
  buildingId: string;
  buildingName: string;
  coordinates: { lat: number; lng: number };
  listingCount: number;
  priceRange: { min: number; max: number };
  listings: RentalListing[];
}

export interface RentalSearchFilters {
  bounds?: { north: number; south: number; east: number; west: number };
  lat?: number;
  lng?: number;
  radius?: number; // km
  priceMin?: number;
  priceMax?: number;
  type?: RentalType[];
  source?: RentalSource[];
  stayLength?: StayLength;
  amenities?: string[];
  tags?: string[];
  sortBy?: 'price' | 'rating' | 'distance';
}
