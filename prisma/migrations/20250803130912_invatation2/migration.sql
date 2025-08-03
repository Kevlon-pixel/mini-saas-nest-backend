/*
  Warnings:

  - You are about to drop the column `createByUserId` on the `Invitation` table. All the data in the column will be lost.
  - Added the required column `createdByUserId` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_organizationId_fkey";

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "createByUserId",
ADD COLUMN     "createdByUserId" INTEGER NOT NULL,
ADD COLUMN     "role" "TenantRole" NOT NULL DEFAULT 'MEMBER';

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
