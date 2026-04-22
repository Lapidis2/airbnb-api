export type ListingTypes="apartment" | "house" | "villa" | "cabin"
export interface Listing{
  id: number;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  guests: number;
  type: ListingTypes;
  amenities: string[];
  rating?: number|undefined;
  host: string;

}

export const listings: Listing[] = [
  {
    id: 1,
    title: "Cozy Apartment",
    description: "Nice place",
    location: "Kigali",
    pricePerNight: 50,
    guests: 2,
    type: "apartment",
    amenities: ["wifi", "kitchen"],
    host: "johnny"
  },
  {
    id: 2,
    title: "Luxury Villa",
    description: "Beautiful villa",
    location: "Musanze",
    pricePerNight: 200,
    guests: 6,
    type: "villa",
    amenities: ["pool", "wifi"],
    host: "bobby"
  },
  {
    id: 3,
    title: "Cabin Retreat",
    description: "Peaceful stay",
    location: "Lake Kivu",
    pricePerNight: 80,
    guests: 4,
    type: "cabin",
    amenities: ["fireplace"],
    host: "johnny"
  },
  {
     id: 4,
    title: "Cabin Retreat",
    description: "Peaceful stay",
    location: "Lake Kivu",
    pricePerNight: 80,
    guests: 4,
    type: "cabin",
    amenities: ["fireplace"],
    host: "johnny"
  }
]