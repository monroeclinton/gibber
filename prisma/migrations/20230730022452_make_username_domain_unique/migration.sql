/*
  Warnings:

  - A unique constraint covering the columns `[username,domain]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Profile_username_key";

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_domain_key" ON "Profile"("username", "domain");
