-- CreateEnum
CREATE TYPE "ComplaintPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "priority" "ComplaintPriority" NOT NULL DEFAULT 'MEDIUM';
