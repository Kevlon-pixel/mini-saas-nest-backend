-- AlterTable
ALTER TABLE "Membership" ALTER COLUMN "role" SET DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "countOfMembers" INTEGER NOT NULL DEFAULT 1;
