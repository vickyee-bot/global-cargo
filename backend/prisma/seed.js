import { seedUsers } from "./seeds/users.js";
import { seedClients } from "./seeds/client.js";
import { seedShips } from "./seeds/ships.js";
import { seedPorts } from "./seeds/ports.js";
import { seedCrew } from "./seeds/crew.js";
import { seedCargo } from "./seeds/cargo.js";
import { seedShipments } from "./seeds/shipments.js";

async function main() {
  console.log("🚀 Starting database seeding...");
  
  // Seed independent entities first
  await seedUsers(5);
  await seedClients(20);
  await seedShips(10);
  await seedPorts(10);
  
  // Seed dependent entities
  await seedCrew(30);
  await seedCargo(50);
  await seedShipments(20);
  
  console.log("✅ All seeding completed!");
}

main().catch((e) => console.error(e));
