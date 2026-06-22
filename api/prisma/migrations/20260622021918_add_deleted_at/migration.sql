-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Auction_deletedAt_idx" ON "Auction"("deletedAt");
