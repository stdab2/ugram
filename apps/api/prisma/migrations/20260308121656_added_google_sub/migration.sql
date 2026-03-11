/*
  Warnings:

  - A unique constraint covering the columns `[googleSub]` on the table `UserUgram` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserUgram" ADD COLUMN     "googleSub" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserUgram_googleSub_key" ON "UserUgram"("googleSub");
