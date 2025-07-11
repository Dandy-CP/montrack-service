/*
  Warnings:

  - You are about to drop the column `goals_owner_id` on the `Goals` table. All the data in the column will be lost.
  - You are about to drop the column `pocket_owner_id` on the `Pocket` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_owner_id` on the `RecentTransaction` table. All the data in the column will be lost.
  - Added the required column `wallet_owner_id` to the `Goals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wallet_owner_id` to the `Pocket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wallet_owner_id` to the `RecentTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Goals" DROP CONSTRAINT "Goals_goals_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "Pocket" DROP CONSTRAINT "Pocket_pocket_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "RecentTransaction" DROP CONSTRAINT "RecentTransaction_transaction_owner_id_fkey";

-- AlterTable
ALTER TABLE "Goals" DROP COLUMN "goals_owner_id",
ADD COLUMN     "wallet_owner_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pocket" DROP COLUMN "pocket_owner_id",
ADD COLUMN     "wallet_owner_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RecentTransaction" DROP COLUMN "transaction_owner_id",
ADD COLUMN     "wallet_owner_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Pocket" ADD CONSTRAINT "Pocket_wallet_owner_id_fkey" FOREIGN KEY ("wallet_owner_id") REFERENCES "Wallet"("wallet_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goals" ADD CONSTRAINT "Goals_wallet_owner_id_fkey" FOREIGN KEY ("wallet_owner_id") REFERENCES "Wallet"("wallet_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentTransaction" ADD CONSTRAINT "RecentTransaction_wallet_owner_id_fkey" FOREIGN KEY ("wallet_owner_id") REFERENCES "Wallet"("wallet_id") ON DELETE RESTRICT ON UPDATE CASCADE;
