-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "goalAmount" INTEGER NOT NULL,
    "currentAmount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "coverImageUrl" TEXT,
    "ownerKey" TEXT NOT NULL DEFAULT 'local-dev',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Campaign" ("category", "coverImageUrl", "createdAt", "currentAmount", "goalAmount", "id", "shortDesc", "status", "story", "title", "updatedAt") SELECT "category", "coverImageUrl", "createdAt", "currentAmount", "goalAmount", "id", "shortDesc", "status", "story", "title", "updatedAt" FROM "Campaign";
DROP TABLE "Campaign";
ALTER TABLE "new_Campaign" RENAME TO "Campaign";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
