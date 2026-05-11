-- CreateEnum
CREATE TYPE "HostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hostStatus" "HostStatus";
