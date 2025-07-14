/*
  Warnings:

  - Changed the type of `transaction_type` on the `RecentTransaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `transaction_from` on the `RecentTransaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "RecentTransaction" DROP COLUMN "transaction_type",
ADD COLUMN     "transaction_type" TEXT NOT NULL,
DROP COLUMN "transaction_from",
ADD COLUMN     "transaction_from" TEXT NOT NULL;

-- DropEnum
DROP TYPE "TransactionFrom";

-- DropEnum
DROP TYPE "TransactionType";
