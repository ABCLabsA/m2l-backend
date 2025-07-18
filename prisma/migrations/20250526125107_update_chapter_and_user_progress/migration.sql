/*
  Warnings:

  - You are about to drop the column `is_completed` on the `user_progress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[next_chapter_id]` on the table `chapter` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `chapter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `chapter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "chapter" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "next_chapter_id" TEXT,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_progress" DROP COLUMN "is_completed",
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "completed_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "chapter_next_chapter_id_key" ON "chapter"("next_chapter_id");

-- AddForeignKey
ALTER TABLE "chapter" ADD CONSTRAINT "chapter_next_chapter_id_fkey" FOREIGN KEY ("next_chapter_id") REFERENCES "chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
