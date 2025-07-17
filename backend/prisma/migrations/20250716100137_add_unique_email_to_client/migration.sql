/*
  Warnings:

  - A unique constraint covering the columns `[email_address]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Client_email_address_key" ON "Client"("email_address");
