import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Users (hosts and guests)
  const users = await prisma.user.createMany({
    data: [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        username: 'alicej',
        phone: '+1234567890',
        role: 'HOST',
        bio: 'Host with beautiful properties',
        password: '$2a$10$tSIflKYu8z1b3/ZCoo1V.eUkX9z/wQPbG6I7xY3/8cE7v0GHRP4OG', // "password123"
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        username: 'bobsmith',
        phone: '+1234567891',
        role: 'GUEST',
        bio: 'Travel enthusiast',
        password: '$2a$10$tSIflKYu8z1b3/ZCoo1V.eUkX9z/wQPbG6I7xY3/8cE7v0GHRP4OG',
      },
      {
        name: 'Carol Davis',
        email: 'carol@example.com',
        username: 'carold',
        phone: '+1234567892',
        role: 'HOST',
        bio: 'Luxury villa owner',
        password: '$2a$10$tSIflKYu8z1b3/ZCoo1V.eUkX9z/wQPbG6I7xY3/8cE7v0GHRP4OG',
      },
      {
        name: 'David Wilson',
        email: 'david@example.com',
        username: 'davidw',
        phone: '+1234567893',
        role: 'GUEST',
        bio: 'Adventure seeker',
        password: '$2a$10$tSIflKYu8z1b3/ZCoo1V.eUkX9z/wQPbG6I7xY3/8cE7v0GHRP4OG',
      },
      {
        name: 'Emma Thompson',
        email: 'emma@example.com',
        username: 'emmat',
        phone: '+1234567894',
        role: 'GUEST',
        bio: 'Digital nomad',
        password: '$2a$10$tSIflKYu8z1b3/ZCoo1V.eUkX9z/wQPbG6I7xY3/8cE7v0GHRP4OG',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✓ Users created');

  // Fetch the created users
  const [alice, bob, carol, david, emma] = await prisma.user.findMany({
    where: {
      email: {
        in: ['alice@example.com', 'bob@example.com', 'carol@example.com', 'david@example.com', 'emma@example.com'],
      },
    },
    orderBy: { id: 'asc' },
  });

  // Create Listings
  const listings = await prisma.listing.createMany({
    data: [
      {
        title: 'Cozy Downtown Apartment',
        description: 'Modern apartment in the heart of the city with amazing views',
        location: 'New York, NY',
        pricePerNight: 120,
        guests: 2,
        type: 'APARTMENT',
        amenities: ['WiFi', 'Gym', 'Parking'],
        hostId: alice.id,
      },
      {
        title: 'Lakeside Cabin Retreat',
        description: 'Peaceful cabin by the lake perfect for weekend getaways',
        location: 'Lake Tahoe, CA',
        pricePerNight: 180,
        guests: 4,
        type: 'CABIN',
        amenities: ['Fireplace', 'Lake access', 'Heated floors'],
        hostId: carol.id,
      },
      {
        title: 'Sunny Beach House',
        description: 'Walk to the beach from this beautiful coastal home',
        location: 'Miami, FL',
        pricePerNight: 250,
        guests: 6,
        type: 'HOUSE',
        amenities: ['Pool', 'Beach access', 'Barbecue'],
        hostId: alice.id,
      },
      {
        title: 'Luxury Villa with Pool',
        description: 'Stunning villa with infinity pool and ocean view',
        location: 'Malibu, CA',
        pricePerNight: 500,
        guests: 8,
        type: 'VILLA',
        amenities: ['Infinity pool', 'Ocean view', 'Chef kitchen'],
        hostId: carol.id,
      },
      {
        title: 'Mountain Getaway Cabin',
        description: 'Secluded cabin with breathtaking mountain views',
        location: 'Aspen, CO',
        pricePerNight: 220,
        guests: 4,
        type: 'CABIN',
        amenities: ['Ski-in/Ski-out', 'Hot tub', 'Fireplace'],
        hostId: alice.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✓ Listings created');

  // Fetch the created listings
  const createdListings = await prisma.listing.findMany({
    where: {
      title: {
        in: [
          'Cozy Downtown Apartment',
          'Lakeside Cabin Retreat',
          'Sunny Beach House',
          'Luxury Villa with Pool',
          'Mountain Getaway Cabin',
        ],
      },
    },
    orderBy: { id: 'asc' },
  });

  const [
    apartment, // id: 1
    cabin, // id: 2
    beachHouse, // id: 3
    villa, // id: 4
    mountainCabin, // id: 5
  ] = createdListings;

  console.log('✓ Fetched listings with IDs:', createdListings.map(l => ({ id: l.id, title: l.title })));

  // Create Bookings with various statuses and dates
  const bookings = await prisma.booking.createMany({
    data: [
      // Bookings for Bob
      {
        checkIn: new Date('2026-05-15'),
        checkOut: new Date('2026-05-20'),
        totalPrice: 600, // (20-15) * 120 = 5 * 120 = 600
        status: 'CONFIRMED',
        guestId: bob.id,
        listingId: apartment.id,
      },
      {
        checkIn: new Date('2026-07-01'),
        checkOut: new Date('2026-07-10'),
        totalPrice: 1620, // 9 * 180
        status: 'PENDING',
        guestId: bob.id,
        listingId: cabin.id,
      },

      // Bookings for David
      {
        checkIn: new Date('2026-06-20'),
        checkOut: new Date('2026-06-25'),
        totalPrice: 1250, // 5 * 250
        status: 'CONFIRMED',
        guestId: david.id,
        listingId: beachHouse.id,
      },
      {
        checkIn: new Date('2026-08-15'),
        checkOut: new Date('2026-08-20'),
        totalPrice: 2500, // 5 * 500
        status: 'PENDING',
        guestId: david.id,
        listingId: villa.id,
      },
      {
        checkIn: new Date('2026-09-10'),
        checkOut: new Date('2026-09-15'),
        totalPrice: 1100, // 5 * 220
        status: 'CANCELLED',
        guestId: david.id,
        listingId: mountainCabin.id,
      },

      // Bookings for Emma
      {
        checkIn: new Date('2026-05-01'),
        checkOut: new Date('2026-05-08'),
        totalPrice: 840, // 7 * 120
        status: 'CONFIRMED',
        guestId: emma.id,
        listingId: apartment.id,
      },
      {
        checkIn: new Date('2026-10-01'),
        checkOut: new Date('2026-10-05'),
        totalPrice: 720, // 4 * 180
        status: 'PENDING',
        guestId: emma.id,
        listingId: cabin.id,
      },
      {
        checkIn: new Date('2026-11-20'),
        checkOut: new Date('2026-11-27'),
        totalPrice: 1750, // 7 * 250
        status: 'PENDING',
        guestId: emma.id,
        listingId: beachHouse.id,
      },
    ],
  });

  console.log('✓ Bookings created');

  console.log('✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
