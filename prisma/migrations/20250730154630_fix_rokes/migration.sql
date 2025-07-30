/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('USER', 'SUPPORT', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "SystemRole" NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "RolesEnum";
