import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const userRoles = ["ADMIN", "USER", "MANAGER"];

export async function seedUsers(count = 5) {
  console.log(`🌱 Seeding ${count} Users...`);
  
  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const defaultAdmin = {
    username: "admin",
    email: "admin@cargotracker.com",
    password: hashedPassword,
    fullName: "System Administrator",
    role: "ADMIN",
  };

  // Create additional users
  const users = await Promise.all(
    Array.from({ length: count - 1 }).map(async () => {
      const password = await bcrypt.hash("password123", 10);
      return {
        username: faker.internet.username(),
        email: faker.internet.email(),
        password,
        fullName: faker.person.fullName(),
        role: faker.helpers.arrayElement(userRoles),
      };
    })
  );

  // Add default admin to the list
  users.unshift(defaultAdmin);

  await prisma.user.createMany({ data: users });
  console.log(`✅ Seeded ${count} users (including default admin)`);
  console.log(`🔑 Default admin login: username=admin, password=admin123`);
}