import { PrismaClient, Role, ListingType, BookingStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  // Clear existing data (idempotent seed)
  await prisma.booking.deleteMany();
  await prisma.listingPhoto.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  // =====================
  // 1. USERS
  // =====================
  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      username: "alicej",
      phone: "+1234567890",
      role: Role.HOST,
      bio: "Host with beautiful properties",
      password: "hashedpassword",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@example.com",
      username: "bobsmith",
      phone: "+1234567891",
      role: Role.GUEST,
      bio: "Travel enthusiast",
      password: "hashedpassword",
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: "Carol Davis",
      email: "carol@example.com",
      username: "carold",
      phone: "+1234567892",
      role: Role.HOST,
      bio: "Luxury villa owner",
      password: "hashedpassword",
    },
  });

  const david = await prisma.user.create({
    data: {
      name: "David Wilson",
      email: "david@example.com",
      username: "davidw",
      phone: "+1234567893",
      role: Role.GUEST,
      bio: "Adventure seeker",
      password: "hashedpassword",
    },
  });

  const emma = await prisma.user.create({
    data: {
      name: "Emma Thompson",
      email: "emma@example.com",
      username: "emmat",
      phone: "+1234567894",
      role: Role.GUEST,
      bio: "Digital nomad",
      password: "hashedpassword",
    },
  });

  console.log("✓ Users created");

  // =====================
  // 2. LISTINGS
  // =====================
  const apartment = await prisma.listing.create({
    data: {
      title: "Cozy Downtown Apartment",
      description: "Modern apartment in the heart of the city",
      location: "New York, NY",
      pricePerNight: 120,
      guests: 2,
      type: ListingType.APARTMENT,
      amenities: ["WiFi", "Gym", "Parking"],
      hostId: alice.id,
    },
  });

  const cabin = await prisma.listing.create({
    data: {
      title: "Lakeside Cabin Retreat",
      description: "Peaceful cabin by the lake",
      location: "Lake Tahoe, CA",
      pricePerNight: 180,
      guests: 4,
      type: ListingType.CABIN,
      amenities: ["Fireplace", "Lake access"],
      hostId: carol.id,
    },
  });

  const beachHouse = await prisma.listing.create({
    data: {
      title: "Sunny Beach House",
      description: "Walk to the beach",
      location: "Miami, FL",
      pricePerNight: 250,
      guests: 6,
      type: ListingType.HOUSE,
      amenities: ["Pool", "Beach access"],
      hostId: alice.id,
    },
  });

  const villa = await prisma.listing.create({
    data: {
      title: "Luxury Villa with Pool",
      description: "Infinity pool ocean view villa",
      location: "Malibu, CA",
      pricePerNight: 500,
      guests: 8,
      type: ListingType.VILLA,
      amenities: ["Pool", "Ocean view"],
      hostId: carol.id,
    },
  });

  const mountainCabin = await prisma.listing.create({
    data: {
      title: "Mountain Getaway Cabin",
      description: "Secluded mountain cabin",
      location: "Aspen, CO",
      pricePerNight: 220,
      guests: 4,
      type: ListingType.CABIN,
      amenities: ["Hot tub", "Fireplace"],
      hostId: alice.id,
    },
  });

  console.log("✓ Listings created");

  // =====================
  // 3. BOOKINGS
  // =====================
  await prisma.booking.createMany({
    data: [
      {
        checkIn: new Date("2026-05-15"),
        checkOut: new Date("2026-05-20"),
        totalPrice: 600,
        status: BookingStatus.CONFIRMED,
        guestId: bob.id,
        listingId: apartment.id,
      },
      {
        checkIn: new Date("2026-07-01"),
        checkOut: new Date("2026-07-10"),
        totalPrice: 1620,
        status: BookingStatus.PENDING,
        guestId: bob.id,
        listingId: cabin.id,
      },
      {
        checkIn: new Date("2026-06-20"),
        checkOut: new Date("2026-06-25"),
        totalPrice: 1250,
        status: BookingStatus.CONFIRMED,
        guestId: david.id,
        listingId: beachHouse.id,
      },
      {
        checkIn: new Date("2026-08-15"),
        checkOut: new Date("2026-08-20"),
        totalPrice: 2500,
        status: BookingStatus.PENDING,
        guestId: david.id,
        listingId: villa.id,
      },
      {
        checkIn: new Date("2026-09-10"),
        checkOut: new Date("2026-09-15"),
        totalPrice: 1100,
        status: BookingStatus.CANCELLED,
        guestId: david.id,
        listingId: mountainCabin.id,
      },
      {
        checkIn: new Date("2026-05-01"),
        checkOut: new Date("2026-05-08"),
        totalPrice: 840,
        status: BookingStatus.CONFIRMED,
        guestId: emma.id,
        listingId: apartment.id,
      },
    ],
  });

  console.log("✓ Bookings created");

  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(" Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });