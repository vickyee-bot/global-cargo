import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

export async function seedClients(count = 10) {
  console.log(`🌱 Seeding ${count} Clients...`);
  const clients = Array.from({ length: count }).map(() => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number({ style: "international" }),
    address: faker.location.streetAddress(),
  }));

  await prisma.client.createMany({ data: clients });
  console.log(`✅ Seeded ${count} clients`);
}
