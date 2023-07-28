/*
  Warnings:

  - Added the required column `domain` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "headerId" TEXT,
    "avatarId" TEXT,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "summary" TEXT,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Profile_headerId_fkey" FOREIGN KEY ("headerId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Profile_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("avatarId", "createdAt", "followersCount", "followingCount", "headerId", "id", "name", "summary", "updatedAt", "userId", "username") SELECT "avatarId", "createdAt", "followersCount", "followingCount", "headerId", "id", "name", "summary", "updatedAt", "userId", "username" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
