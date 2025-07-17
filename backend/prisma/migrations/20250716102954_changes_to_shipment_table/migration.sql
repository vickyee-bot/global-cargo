/*
  Warnings:

  - You are about to drop the column `cargoId` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `destinationPortId` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `originPortId` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `shipId` on the `Shipment` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "ShipmentStatus" ADD VALUE 'cancelled';

-- DropForeignKey
ALTER TABLE "Shipment" DROP CONSTRAINT "Shipment_cargoId_fkey";

-- DropForeignKey
ALTER TABLE "Shipment" DROP CONSTRAINT "Shipment_destinationPortId_fkey";

-- DropForeignKey
ALTER TABLE "Shipment" DROP CONSTRAINT "Shipment_originPortId_fkey";

-- DropForeignKey
ALTER TABLE "Shipment" DROP CONSTRAINT "Shipment_shipId_fkey";

-- AlterTable
ALTER TABLE "Shipment" DROP COLUMN "cargoId",
DROP COLUMN "destinationPortId",
DROP COLUMN "originPortId",
DROP COLUMN "shipId",
ADD COLUMN     "cargo_id" INTEGER,
ADD COLUMN     "destination_port_id" INTEGER,
ADD COLUMN     "origin_port_id" INTEGER,
ADD COLUMN     "ship_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "Cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_ship_id_fkey" FOREIGN KEY ("ship_id") REFERENCES "Ship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_origin_port_id_fkey" FOREIGN KEY ("origin_port_id") REFERENCES "Port"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_destination_port_id_fkey" FOREIGN KEY ("destination_port_id") REFERENCES "Port"("id") ON DELETE SET NULL ON UPDATE CASCADE;
