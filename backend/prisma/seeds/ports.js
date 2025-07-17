import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

export async function seedPorts(count = 5) {
  console.log(`🌱 Seeding ${count} Ports...`);
  const ports = Array.from({ length: count }).map(() => ({
    name: `${faker.location.city()} Port`,
    country: faker.location.country(),
    portType: "Cargo",
    coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
    dockingCapacity: faker.number.int({ min: 10, max: 100 }),
    customsAuthorized: faker.datatype.boolean(),
  }));

  await prisma.port.createMany({ data: ports });
  console.log(`✅ Seeded ${count} ports`);
}
