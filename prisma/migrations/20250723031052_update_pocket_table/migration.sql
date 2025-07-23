/*
  Warnings:

  - Added the required column `pocket_emoji` to the `Pocket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pocket_set_amount` to the `Pocket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pocket" ADD COLUMN     "pocket_emoji" TEXT NOT NULL,
ADD COLUMN     "pocket_set_amount" INTEGER NOT NULL;
