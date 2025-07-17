import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();
const statuses = ["pending", "in_transit", "delivered", "delayed"];

export async function seedShipments(count = 5) {
  console.log(`🌱 Seeding ${count} Shipments...`);
  const [cargo, ships, ports] = await Promise.all([
    prisma.cargo.findMany(),
    prisma.ship.findMany(),
    prisma.port.findMany(),
  ]);

  if (cargo.length === 0 || ships.length === 0 || ports.length < 2) {
    throw new Error("Not enough data to seed shipments.");
  }

  const shipments = Array.from({ length: count }).map(() => {
    const origin = faker.helpers.arrayElement(ports);
    let destination = faker.helpers.arrayElement(ports);
    while (destination.id === origin.id) {
      destination = faker.helpers.arrayElement(ports);
    }
    return {
      cargoId: faker.helpers.arrayElement(cargo).id,
      shipId: faker.helpers.arrayElement(ships).id,
      originPortId: origin.id,
      destinationPortId: destination.id,
      departureDate: faker.date.future(),
      arrivalEstimate: faker.date.future({
        refDate: new Date(Date.now() + 86400000),
      }),
      status: faker.helpers.arrayElement(statuses),
    };
  });

  await prisma.shipment.createMany({ data: shipments });
  console.log(`✅ Seeded ${count} shipments`);
}
