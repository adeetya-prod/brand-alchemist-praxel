-- AlterTable
ALTER TABLE "Creative" ADD COLUMN     "editedPrompt" TEXT,
ADD COLUMN     "parentCreativeId" TEXT,
ADD COLUMN     "variantIndex" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Creative_parentCreativeId_idx" ON "Creative"("parentCreativeId");

-- AddForeignKey
ALTER TABLE "Creative" ADD CONSTRAINT "Creative_parentCreativeId_fkey" FOREIGN KEY ("parentCreativeId") REFERENCES "Creative"("id") ON DELETE SET NULL ON UPDATE CASCADE;
