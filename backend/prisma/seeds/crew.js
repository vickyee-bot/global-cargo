import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();
const roles = [
  "Captain",
  "Chief_Officer",
  "Able_Seaman",
  "Ordinary_Seaman",
  "Engine_Cadet",
  "Radio_Officer",
  "Chief_Cook",
  "Steward",
  "Deckhand",
];

export async function seedCrew(count = 10) {
  console.log(`🌱 Seeding ${count} Crew Members...`);
  const ships = await prisma.ship.findMany();
  if (ships.length === 0) throw new Error("No ships found. Seed ships first.");

  const crew = Array.from({ length: count }).map(() => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: faker.helpers.arrayElement(roles),
    phoneNumber: faker.phone.number({ style: "international" }),
    nationality: faker.location.country(),
    shipId: faker.helpers.arrayElement(ships).id,
  }));

  await prisma.crew.createMany({ data: crew });
  console.log(`✅ Seeded ${count} crew members`);
}
