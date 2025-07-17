/*
  Warnings:

  - You are about to drop the column `cargoType` on the `Cargo` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `Cargo` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cargo" DROP CONSTRAINT "Cargo_clientId_fkey";

-- AlterTable
ALTER TABLE "Cargo" DROP COLUMN "cargoType",
DROP COLUMN "clientId",
ADD COLUMN     "cargo_type" "CargoType" NOT NULL DEFAULT 'general',
ADD COLUMN     "client_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Cargo" ADD CONSTRAINT "Cargo_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
