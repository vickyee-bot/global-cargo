import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();
const cargoTypes = ["perishable", "dangerous", "general", "other"];

export async function seedCargo(count = 10) {
  console.log(`🌱 Seeding ${count} Cargo Records...`);
  const clients = await prisma.client.findMany();
  if (clients.length === 0)
    throw new Error("No clients found. Seed clients first.");

  const cargo = Array.from({ length: count }).map(() => ({
    description: faker.commerce.productName(),
    weight: faker.number.float({ min: 100, max: 5000, precision: 0.01 }),
    volume: faker.number.float({ min: 10, max: 500, precision: 0.01 }),
    clientId: faker.helpers.arrayElement(clients).id,
    cargoType: faker.helpers.arrayElement(cargoTypes),
  }));

  await prisma.cargo.createMany({ data: cargo });
  console.log(`✅ Seeded ${count} cargo items`);
}
