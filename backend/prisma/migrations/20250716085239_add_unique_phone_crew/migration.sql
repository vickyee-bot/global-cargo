/*
  Warnings:

  - A unique constraint covering the columns `[phone_number]` on the table `Crew` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Crew_phone_number_key" ON "Crew"("phone_number");
