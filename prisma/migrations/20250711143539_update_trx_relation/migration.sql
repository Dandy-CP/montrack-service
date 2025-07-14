-- DropForeignKey
ALTER TABLE "RecentTransaction" DROP CONSTRAINT "RecentTransaction_goals_history_id_fkey";

-- DropForeignKey
ALTER TABLE "RecentTransaction" DROP CONSTRAINT "RecentTransaction_pocket_history_id_fkey";

-- AlterTable
ALTER TABLE "RecentTransaction" ALTER COLUMN "goals_history_id" DROP NOT NULL,
ALTER COLUMN "pocket_history_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "RecentTransaction" ADD CONSTRAINT "RecentTransaction_goals_history_id_fkey" FOREIGN KEY ("goals_history_id") REFERENCES "Goals"("goals_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentTransaction" ADD CONSTRAINT "RecentTransaction_pocket_history_id_fkey" FOREIGN KEY ("pocket_history_id") REFERENCES "Pocket"("pocket_id") ON DELETE SET NULL ON UPDATE CASCADE;
