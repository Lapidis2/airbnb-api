import "dotenv/config";
import { Role, ListingType, BookingStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../src/config/prismaConfig";

// ─────────────────────────────────────────────
//  USERS (FAST - no relations)
// ─────────────────────────────────────────────
async function seedUsers() {
  const password = await bcrypt.hash("password123", 10);

  const users = Array.from({ length: 10 }).map((_, i) => ({
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    username: `user${i + 1}`,
    phone: `+25078800000${i}`,
    password,
    role: (i < 4 ? Role.HOST : Role.GUEST) as Role,
  }));

  await prisma.user.createMany({ data: users });

  return prisma.user.findMany();
}

// ─────────────────────────────────────────────
//  LISTINGS (RELATION: host → user)
// ─────────────────────────────────────────────
async function seedListings(hosts: any[]) {
  const listings = [];

  for (let i = 0; i < 10; i++) {
    const listing = await prisma.listing.create({
      data: {
        title: `Listing ${i + 1}`,
        description: "Nice place in Kigali",
        location: "Kigali, Rwanda",
        pricePerNight: 50 + i * 10,
        guests: 2,
        type: ListingType.APARTMENT,
        amenities: ["WiFi", "Kitchen"],
        rating: 4,

     
        host: {
          connect: { id: hosts[i % hosts.length].id },
        },
      },
    });

    listings.push(listing);
  }

  return listings;
}

// ─────────────────────────────────────────────
//  LISTING PHOTOS (RELATION: listing)
// ─────────────────────────────────────────────
async function seedListingPhotos(listings: any[]) {
  const photos = [];

  for (const listing of listings) {
    const photoCount = 2 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < photoCount; i++) {
      const photo = await prisma.listingPhoto.create({
        data: {
          url: `https://picsum.photos/800/600?random=${listing.id}-${i}`,
          publicId: `listing_${listing.id}_photo_${i}`,
          isPrimary: i === 0,
          listing: {
            connect: { id: listing.id },
          },
        },
      });

      photos.push(photo);
    }
  }

  return photos;
}

// ─────────────────────────────────────────────
//  BOOKINGS (RELATIONS: guest + listing)
// ─────────────────────────────────────────────
async function seedBookings(users: any[], listings: any[]) {
  const guests = users.filter((u) => u.role === "GUEST");

  const bookings = [];

  for (let i = 0; i < 10; i++) {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + i * 2);

    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2);

    const booking = await prisma.booking.create({
      data: {
        checkIn,
        checkOut,
        totalPrice: 100,
        status: ([BookingStatus.CONFIRMED, BookingStatus.PENDING, BookingStatus.CANCELLED][i % 3]) as BookingStatus,

        
        guest: {
          connect: { id: guests[i % guests.length].id },
        },
        listing: {
          connect: { id: listings[i % listings.length].id },
        },
      },
    });

    bookings.push(booking);
  }

  return bookings;
}



// ────────────────────────────────────────────
//  MAIN (TRANSACTION)
// ────────────────────────────────────────────
async function main() {
  console.log(" Hybrid seeding...");

  //  Clean
  await prisma.listingPhoto.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  console.log(" Database cleared");

  //  Seed
  const users = await seedUsers();
  const hosts = users.filter((u) => u.role === "HOST");

  const listings = await seedListings(hosts);
  const photos = await seedListingPhotos(listings);
  const bookings = await seedBookings(users, listings);

  console.log(" Seed complete");
  console.log(`Users: ${users.length}`);
  console.log(`Listings: ${listings.length}`);
  console.log(`Photos: ${photos.length}`);
  console.log(`Bookings: ${bookings.length}`);
}

// ────────────────────────────────────────────
//  RUN
// ────────────────────────────────────────────
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });