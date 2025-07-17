/*
  Warnings:

  - A unique constraint covering the columns `[name,country]` on the table `Port` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Port_name_country_key" ON "Port"("name", "country");
