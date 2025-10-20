-- CreateEnum
CREATE TYPE "ShipType" AS ENUM ('cargo ship', 'passenger ship', 'military ship', 'icebreaker', 'fishing vessel', 'barge ship');

-- CreateEnum
CREATE TYPE "ShipStatus" AS ENUM ('active', 'under maintenance', 'decommissioned');

-- CreateEnum
CREATE TYPE "CrewRole" AS ENUM ('Captain', 'Chief Officer', 'Able Seaman', 'Ordinary Seaman', 'Engine Cadet', 'Radio Officer', 'Chief Cook', 'Steward', 'Deckhand');

-- CreateEnum
CREATE TYPE "CargoType" AS ENUM ('perishable', 'dangerous', 'general', 'other');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('pending', 'in_transit', 'delivered', 'delayed');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'MANAGER');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(150) NOT NULL,
    "last_name" VARCHAR(150) NOT NULL,
    "email_address" VARCHAR(150),
    "phone_number" VARCHAR(50),
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ships" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "registration_number" VARCHAR(200) NOT NULL,
    "capacity_in_tonnes" DECIMAL(10,2),
    "type" "ShipType" NOT NULL DEFAULT 'cargo ship',
    "status" "ShipStatus" NOT NULL DEFAULT 'active',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crew" (
    "id" SERIAL NOT NULL,
    "ship_id" INTEGER,
    "first_name" VARCHAR(150) NOT NULL,
    "last_name" VARCHAR(150) NOT NULL,
    "role" "CrewRole" NOT NULL DEFAULT 'Captain',
    "phone_number" VARCHAR(30) NOT NULL,
    "nationality" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "crew_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ports" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "port_type" VARCHAR(100),
    "coordinates" VARCHAR(50),
    "depth" DOUBLE PRECISION,
    "docking_capacity" INTEGER,
    "max_vessel_size" DOUBLE PRECISION,
    "security_level" VARCHAR(50),
    "customs_authorized" BOOLEAN,
    "operational_hours" VARCHAR(50),
    "port_manager" VARCHAR(255),
    "port_contact_info" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "weight" DECIMAL(10,2),
    "volume" DECIMAL(10,2),
    "client_id" INTEGER,
    "cargo_type" "CargoType" NOT NULL DEFAULT 'general',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" SERIAL NOT NULL,
    "cargo_id" INTEGER,
    "ship_id" INTEGER,
    "origin_port_id" INTEGER,
    "destination_port_id" INTEGER,
    "departure_date" DATE,
    "arrival_estimate" DATE,
    "actual_arrival_date" DATE,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'pending',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_address_key" ON "clients"("email_address");

-- CreateIndex
CREATE UNIQUE INDEX "ships_registration_number_key" ON "ships"("registration_number");

-- CreateIndex
CREATE UNIQUE INDEX "ports_name_country_key" ON "ports"("name", "country");

-- AddForeignKey
ALTER TABLE "crew" ADD CONSTRAINT "crew_ship_id_fkey" FOREIGN KEY ("ship_id") REFERENCES "ships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_ship_id_fkey" FOREIGN KEY ("ship_id") REFERENCES "ships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_origin_port_id_fkey" FOREIGN KEY ("origin_port_id") REFERENCES "ports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_destination_port_id_fkey" FOREIGN KEY ("destination_port_id") REFERENCES "ports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
