/*
  Warnings:

  - A unique constraint covering the columns `[imageKey]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "imageKey" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "imageStatus" TEXT NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "imageUrl" DROP NOT NULL;
