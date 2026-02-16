/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authorId` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageLink` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "hashtags" TEXT,
ADD COLUMN     "imageLink" TEXT NOT NULL;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "UserUgram" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "picture" TEXT,

    CONSTRAINT "UserUgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserMentions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserMentions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserUgram_userName_key" ON "UserUgram"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "UserUgram_email_key" ON "UserUgram"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserUgram_phoneNumber_key" ON "UserUgram"("phoneNumber");

-- CreateIndex
CREATE INDEX "_UserMentions_B_index" ON "_UserMentions"("B");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "UserUgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserMentions" ADD CONSTRAINT "_UserMentions_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserMentions" ADD CONSTRAINT "_UserMentions_B_fkey" FOREIGN KEY ("B") REFERENCES "UserUgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
