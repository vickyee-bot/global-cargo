import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();
const shipTypes = [
  "cargo_ship",
  "passenger_ship",
  "military_ship",
  "icebreaker",
  "fishing_vessel",
  "barge_ship",
];

export async function seedShips(count = 5) {
  console.log(`🌱 Seeding ${count} Ships...`);
  const ships = Array.from({ length: count }).map((_, i) => ({
    name: faker.company.name() + " Ship",
    registrationNumber: `SHIP-${100 + i}`,
    capacityInTonnes: faker.number.float({
      min: 1000,
      max: 20000,
      precision: 0.01,
    }),
    type: faker.helpers.arrayElement(shipTypes),
  }));

  await prisma.ship.createMany({ data: ships });
  console.log(`✅ Seeded ${count} ships`);
}
