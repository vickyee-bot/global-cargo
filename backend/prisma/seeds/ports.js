import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

export async function seedPorts(count = 5) {
  console.log(`🌱 Seeding ${count} Ports...`);
  
  // Major global ports with real coordinates
  const majorPorts = [
    { name: "Port of Shanghai", country: "China", latitude: 31.2304, longitude: 121.4737 },
    { name: "Port of Singapore", country: "Singapore", latitude: 1.2966, longitude: 103.8006 },
    { name: "Port of Ningbo-Zhoushan", country: "China", latitude: 29.8683, longitude: 121.5440 },
    { name: "Port of Shenzhen", country: "China", latitude: 22.5431, longitude: 114.0579 },
    { name: "Port of Guangzhou", country: "China", latitude: 23.1291, longitude: 113.2644 },
    { name: "Port of Busan", country: "South Korea", latitude: 35.1796, longitude: 129.0756 },
    { name: "Port of Hong Kong", country: "Hong Kong", latitude: 22.3193, longitude: 114.1694 },
    { name: "Port of Qingdao", country: "China", latitude: 36.0986, longitude: 120.3719 },
    { name: "Port of Dubai", country: "UAE", latitude: 25.2697, longitude: 55.3094 },
    { name: "Port of Rotterdam", country: "Netherlands", latitude: 51.9225, longitude: 4.4792 },
    { name: "Port of Antwerp", country: "Belgium", latitude: 51.2993, longitude: 4.4518 },
    { name: "Port of Los Angeles", country: "USA", latitude: 33.7365, longitude: -118.2923 },
    { name: "Port of Long Beach", country: "USA", latitude: 33.7701, longitude: -118.2437 },
    { name: "Port of Hamburg", country: "Germany", latitude: 53.5448, longitude: 9.9865 },
    { name: "Port of New York", country: "USA", latitude: 40.6892, longitude: -74.0445 }
  ];
  
  const portsToSeed = majorPorts.slice(0, count).map(port => ({
    name: port.name,
    country: port.country,
    latitude: port.latitude,
    longitude: port.longitude,
    coordinates: `${port.latitude},${port.longitude}`,
    portType: "Cargo",
    dockingCapacity: faker.number.int({ min: 20, max: 150 }),
    maxVesselSize: faker.number.float({ min: 200, max: 400, precision: 0.1 }),
    depth: faker.number.float({ min: 10, max: 25, precision: 0.1 }),
    customsAuthorized: true,
    operationalHours: "24/7",
    securityLevel: "Level 1"
  }));

  await prisma.port.createMany({ data: portsToSeed });
  console.log(`✅ Seeded ${count} major ports with coordinates`);
}
