-- CreateEnum
CREATE TYPE "JourneyStatus" AS ENUM ('planned', 'in_progress', 'completed', 'cancelled', 'delayed');

-- AlterTable
ALTER TABLE "ports" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "shipments" ADD COLUMN     "journey_id" INTEGER;

-- AlterTable
ALTER TABLE "ships" ADD COLUMN     "current_latitude" DOUBLE PRECISION,
ADD COLUMN     "current_longitude" DOUBLE PRECISION,
ADD COLUMN     "last_position_update" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "journeys" (
    "id" SERIAL NOT NULL,
    "ship_id" INTEGER NOT NULL,
    "origin_port_id" INTEGER NOT NULL,
    "destination_port_id" INTEGER NOT NULL,
    "departure_time" TIMESTAMP(3),
    "estimated_arrival" TIMESTAMP(3),
    "actual_arrival" TIMESTAMP(3),
    "status" "JourneyStatus" NOT NULL DEFAULT 'planned',
    "distance" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ship_positions" (
    "id" SERIAL NOT NULL,
    "ship_id" INTEGER NOT NULL,
    "journey_id" INTEGER,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "heading" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "altitude" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ship_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waypoints" (
    "id" SERIAL NOT NULL,
    "journey_id" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "name" VARCHAR(100),
    "order" INTEGER NOT NULL,
    "reached" BOOLEAN NOT NULL DEFAULT false,
    "reached_at" TIMESTAMP(3),

    CONSTRAINT "waypoints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ship_positions_ship_id_timestamp_idx" ON "ship_positions"("ship_id", "timestamp");

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journeys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_ship_id_fkey" FOREIGN KEY ("ship_id") REFERENCES "ships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_origin_port_id_fkey" FOREIGN KEY ("origin_port_id") REFERENCES "ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_destination_port_id_fkey" FOREIGN KEY ("destination_port_id") REFERENCES "ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ship_positions" ADD CONSTRAINT "ship_positions_ship_id_fkey" FOREIGN KEY ("ship_id") REFERENCES "ships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ship_positions" ADD CONSTRAINT "ship_positions_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journeys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waypoints" ADD CONSTRAINT "waypoints_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
