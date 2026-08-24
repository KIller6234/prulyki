-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "CollectionMethod" AS ENUM ('CONTAINER', 'PACKAGE');

-- CreateEnum
CREATE TYPE "WasteCategory" AS ENUM ('MIXED', 'PLASTIC', 'GLASS', 'PAPER', 'BULK');

-- CreateEnum
CREATE TYPE "SchedulePeriodicity" AS ENUM ('DAILY', 'EVERY_OTHER_DAY', 'WEEKLY', 'TWICE_WEEKLY');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ComplaintType" AS ENUM ('PROPOSAL', 'PETITION', 'COMPLAINT');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('REGISTERED', 'UNDER_REVIEW', 'FORWARDED', 'DONE', 'REJECTED', 'EXTENDED', 'ANNULLED');

-- CreateEnum
CREATE TYPE "DeadlineType" AS ENUM ('GENERAL_30', 'REDUCED_15');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('DISPATCHER', 'INSPECTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('LAW', 'SANITARY_RULE', 'LOCAL_RULE', 'SCHEDULE_INFO', 'OTHER');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "Street" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameNormalized" TEXT NOT NULL,
    "district" TEXT,
    "collectionMethod" "CollectionMethod" NOT NULL DEFAULT 'CONTAINER',
    "primaryCollectionPointId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Street_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionPoint" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "operatorName" TEXT NOT NULL,
    "isBulkWasteSite" BOOLEAN NOT NULL DEFAULT false,
    "fillLevelPercent" INTEGER,
    "lastMeasuredAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "deactivatedAt" TIMESTAMP(3),
    "deactivationReason" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionPointPhoto" (
    "id" TEXT NOT NULL,
    "collectionPointId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionPointPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Container" (
    "id" TEXT NOT NULL,
    "collectionPointId" TEXT NOT NULL,
    "wasteCategory" "WasteCategory" NOT NULL,
    "volumeLiters" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Container_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "capacityM3" DOUBLE PRECISION NOT NULL,
    "fuelNormLPer100km" DOUBLE PRECISION,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleContainer" (
    "id" TEXT NOT NULL,
    "collectionPointId" TEXT NOT NULL,
    "daysOfWeek" INTEGER[],
    "timeFrom" TEXT NOT NULL,
    "periodicity" "SchedulePeriodicity" NOT NULL,
    "vehicleId" TEXT,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleContainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchedulePackage" (
    "id" TEXT NOT NULL,
    "daysOfWeek" INTEGER[],
    "timeFrom" TEXT NOT NULL,
    "periodicity" "SchedulePeriodicity" NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchedulePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchedulePackageStreet" (
    "id" TEXT NOT NULL,
    "schedulePackageId" TEXT NOT NULL,
    "streetId" TEXT NOT NULL,

    CONSTRAINT "SchedulePackageStreet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SortingGuideItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "WasteCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "howToSort" TEXT NOT NULL,
    "isRecyclable" BOOLEAN NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SortingGuideItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "type" "ComplaintType" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "addressText" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "streetId" TEXT,
    "collectionPointId" TEXT,
    "applicantName" TEXT NOT NULL,
    "applicantPhone" TEXT,
    "applicantEmail" TEXT,
    "personalDataConsent" BOOLEAN NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'REGISTERED',
    "deadlineType" "DeadlineType" NOT NULL DEFAULT 'GENERAL_30',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "assignedToStaffId" TEXT,
    "isAnnulled" BOOLEAN NOT NULL DEFAULT false,
    "annulReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintVersion" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" "ComplaintStatus" NOT NULL,
    "resolutionText" TEXT,
    "authorStaffId" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintAttachment" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'DISPATCHER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceType" "KnowledgeSourceType" NOT NULL,
    "sourceUrl" TEXT,
    "fullText" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "citationLabel" TEXT NOT NULL,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "chatSessionId" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "citations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitLog" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "RateLimitLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Street_nameNormalized_idx" ON "Street"("nameNormalized");

-- CreateIndex
CREATE INDEX "CollectionPoint_status_idx" ON "CollectionPoint"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SchedulePackageStreet_schedulePackageId_streetId_key" ON "SchedulePackageStreet"("schedulePackageId", "streetId");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_registrationNumber_key" ON "Complaint"("registrationNumber");

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");

-- CreateIndex
CREATE INDEX "Complaint_registrationNumber_idx" ON "Complaint"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ComplaintVersion_complaintId_versionNumber_key" ON "ComplaintVersion"("complaintId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "StaffUser_email_key" ON "StaffUser"("email");

-- CreateIndex
CREATE INDEX "KnowledgeChunk_documentId_idx" ON "KnowledgeChunk"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatSession_sessionToken_key" ON "ChatSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimitLog_ipHash_endpoint_windowStart_key" ON "RateLimitLog"("ipHash", "endpoint", "windowStart");

-- AddForeignKey
ALTER TABLE "Street" ADD CONSTRAINT "Street_primaryCollectionPointId_fkey" FOREIGN KEY ("primaryCollectionPointId") REFERENCES "CollectionPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionPointPhoto" ADD CONSTRAINT "CollectionPointPhoto_collectionPointId_fkey" FOREIGN KEY ("collectionPointId") REFERENCES "CollectionPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Container" ADD CONSTRAINT "Container_collectionPointId_fkey" FOREIGN KEY ("collectionPointId") REFERENCES "CollectionPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleContainer" ADD CONSTRAINT "ScheduleContainer_collectionPointId_fkey" FOREIGN KEY ("collectionPointId") REFERENCES "CollectionPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleContainer" ADD CONSTRAINT "ScheduleContainer_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchedulePackageStreet" ADD CONSTRAINT "SchedulePackageStreet_schedulePackageId_fkey" FOREIGN KEY ("schedulePackageId") REFERENCES "SchedulePackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchedulePackageStreet" ADD CONSTRAINT "SchedulePackageStreet_streetId_fkey" FOREIGN KEY ("streetId") REFERENCES "Street"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_streetId_fkey" FOREIGN KEY ("streetId") REFERENCES "Street"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_collectionPointId_fkey" FOREIGN KEY ("collectionPointId") REFERENCES "CollectionPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_assignedToStaffId_fkey" FOREIGN KEY ("assignedToStaffId") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintVersion" ADD CONSTRAINT "ComplaintVersion_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintVersion" ADD CONSTRAINT "ComplaintVersion_authorStaffId_fkey" FOREIGN KEY ("authorStaffId") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintAttachment" ADD CONSTRAINT "ComplaintAttachment_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "KnowledgeDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatSessionId_fkey" FOREIGN KEY ("chatSessionId") REFERENCES "ChatSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
