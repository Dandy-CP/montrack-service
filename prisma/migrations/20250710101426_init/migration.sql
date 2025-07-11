-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "TransactionFrom" AS ENUM ('WALLET', 'POCKET', 'GOALS');

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profile_image" TEXT,
    "totp_secrete" TEXT,
    "is_2fa_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "wallet_id" TEXT NOT NULL,
    "wallet_name" TEXT NOT NULL,
    "wallet_amount" INTEGER NOT NULL,
    "is_wallet_active" BOOLEAN NOT NULL DEFAULT false,
    "wallet_owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("wallet_id")
);

-- CreateTable
CREATE TABLE "Pocket" (
    "pocket_id" TEXT NOT NULL,
    "pocket_name" TEXT NOT NULL,
    "pocket_description" TEXT,
    "pocket_ammount" INTEGER NOT NULL,
    "pocket_owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pocket_pkey" PRIMARY KEY ("pocket_id")
);

-- CreateTable
CREATE TABLE "Goals" (
    "goals_id" TEXT NOT NULL,
    "goals_name" TEXT NOT NULL,
    "goals_description" TEXT,
    "goals_set_amount" INTEGER NOT NULL,
    "goals_amount" INTEGER NOT NULL,
    "goals_attachment" TEXT,
    "goals_owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Goals_pkey" PRIMARY KEY ("goals_id")
);

-- CreateTable
CREATE TABLE "RecentTransaction" (
    "transaction_id" TEXT NOT NULL,
    "transaction_name" TEXT NOT NULL,
    "transaction_ammount" INTEGER NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "transaction_from" "TransactionFrom" NOT NULL,
    "transaction_attachment" TEXT,
    "transaction_description" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_owner_id" TEXT NOT NULL,
    "goals_history_id" TEXT NOT NULL,
    "pocket_history_id" TEXT NOT NULL,

    CONSTRAINT "RecentTransaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_wallet_id_key" ON "Wallet"("wallet_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pocket_pocket_id_key" ON "Pocket"("pocket_id");

-- CreateIndex
CREATE UNIQUE INDEX "Goals_goals_id_key" ON "Goals"("goals_id");

-- CreateIndex
CREATE UNIQUE INDEX "RecentTransaction_transaction_id_key" ON "RecentTransaction"("transaction_id");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_wallet_owner_id_fkey" FOREIGN KEY ("wallet_owner_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pocket" ADD CONSTRAINT "Pocket_pocket_owner_id_fkey" FOREIGN KEY ("pocket_owner_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goals" ADD CONSTRAINT "Goals_goals_owner_id_fkey" FOREIGN KEY ("goals_owner_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentTransaction" ADD CONSTRAINT "RecentTransaction_transaction_owner_id_fkey" FOREIGN KEY ("transaction_owner_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentTransaction" ADD CONSTRAINT "RecentTransaction_goals_history_id_fkey" FOREIGN KEY ("goals_history_id") REFERENCES "Goals"("goals_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentTransaction" ADD CONSTRAINT "RecentTransaction_pocket_history_id_fkey" FOREIGN KEY ("pocket_history_id") REFERENCES "Pocket"("pocket_id") ON DELETE RESTRICT ON UPDATE CASCADE;
