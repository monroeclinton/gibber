/*
  Warnings:

  - A unique constraint covering the columns `[profileId,reblogId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Post_profileId_reblogId_key" ON "Post"("profileId", "reblogId");
