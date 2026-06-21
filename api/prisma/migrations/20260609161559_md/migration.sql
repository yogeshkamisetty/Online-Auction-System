-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "buyerPremium" DECIMAL(12,2),
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "platformFee" DECIMAL(12,2),
ADD COLUMN     "verificationNotes" TEXT,
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "verifiedBy" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Auction_status_featured_idx" ON "Auction"("status", "featured");

-- CreateIndex
CREATE INDEX "Auction_sellerId_idx" ON "Auction"("sellerId");

-- CreateIndex
CREATE INDEX "Auction_verificationStatus_idx" ON "Auction"("verificationStatus");
