/*
  Warnings:

  - A unique constraint covering the columns `[id,profileId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Post_id_profileId_key" ON "Post"("id", "profileId");
