-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('NOT_STARTED', 'PIF_PENDING', 'IN_PROGRESS', 'DAY1_READY', 'ONBOARDING_COMPLETED');

-- CreateEnum
CREATE TYPE "PIFType" AS ENUM ('NEW_HIRE', 'REHIRE', 'INTERNAL_TRANSFER');

-- CreateEnum
CREATE TYPE "OrientationLocation" AS ENUM ('REDMOND_ONSITE', 'WEBEX_REMOTE');

-- CreateEnum
CREATE TYPE "HardwareType" AS ENUM ('PC', 'MAC');

-- CreateEnum
CREATE TYPE "EquipmentDeliveryMethod" AS ENUM ('PICKUP', 'SHIP_TO_HOME', 'DESK_SETUP');

-- CreateEnum
CREATE TYPE "I9Status" AS ENUM ('I9_NOT_STARTED', 'I9_EMAIL_SENT', 'I9_SUBMITTED', 'I9_VERIFIED');

-- CreateEnum
CREATE TYPE "AccessReqStatus" AS ENUM ('ACCESS_PENDING', 'ACCESS_COMPLETED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('CONTRACT_DRAFT', 'MANAGER_SIGNED', 'CANDIDATE_SIGNED', 'CONTRACT_COMPLETED');

-- CreateEnum
CREATE TYPE "MedicalClearance" AS ENUM ('MEDICAL_PENDING', 'MEDICAL_CLEARED', 'MEDICAL_BLOCKED');

-- CreateEnum
CREATE TYPE "PayFrequency" AS ENUM ('BIWEEKLY', 'MONTHLY_PAY');

-- CreateTable
CREATE TABLE "OnboardingRecord" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'PIF_PENDING',
    "hireDate" TIMESTAMP(3),
    "orientationDate" TIMESTAMP(3),
    "orientationLocation" "OrientationLocation",
    "neoTimeSlot" TEXT,
    "pifSubmittedAt" TIMESTAMP(3),
    "pifApprovedAt" TIMESTAMP(3),
    "itRequestSubmittedAt" TIMESTAMP(3),
    "itEquipmentReadyAt" TIMESTAMP(3),
    "hNoteGeneratedAt" TIMESTAMP(3),
    "hNoteSentAt" TIMESTAMP(3),
    "backgroundCheckClearedAt" TIMESTAMP(3),
    "neoEmailSentAt" TIMESTAMP(3),
    "preworkCompletedAt" TIMESTAMP(3),
    "greeterAssignedToId" TEXT,
    "greeterLocation" TEXT,
    "greeterMeetingTime" TIMESTAMP(3),
    "greeterConfirmedAt" TIMESTAMP(3),
    "greeterNotes" TEXT,
    "day1ReadyConfirmedAt" TIMESTAMP(3),
    "denaliEmail" TEXT,
    "employeePositionId" TEXT,
    "payFrequency" "PayFrequency",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PIFData" (
    "id" TEXT NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "pifType" "PIFType" NOT NULL DEFAULT 'NEW_HIRE',
    "employeeName" TEXT NOT NULL,
    "jobReqNumber" TEXT NOT NULL,
    "referrerName" TEXT,
    "recruiterName" TEXT,
    "agencyName" TEXT,
    "agencyFee" TEXT,
    "positionTitle" TEXT NOT NULL,
    "officeLocation" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "neoLocation" TEXT,
    "clientOnsiteStartDate" TIMESTAMP(3),
    "employeeType" TEXT,
    "bonusCommissionPlan" TEXT,
    "payRate" TEXT,
    "billRate" TEXT,
    "managerName" TEXT NOT NULL,
    "accountingCode" TEXT NOT NULL,
    "supervisorRole" BOOLEAN NOT NULL DEFAULT false,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "salesforceAccess" BOOLEAN NOT NULL DEFAULT false,
    "cpqPermissions" BOOLEAN NOT NULL DEFAULT false,
    "kimbleApproval" BOOLEAN NOT NULL DEFAULT false,
    "kimbleTimeEntry" BOOLEAN NOT NULL DEFAULT true,
    "businessCards" BOOLEAN NOT NULL DEFAULT false,
    "itEquipmentNeeded" BOOLEAN NOT NULL DEFAULT true,
    "client" TEXT,
    "drugScreenRequired" BOOLEAN NOT NULL DEFAULT false,
    "tbTestRequired" BOOLEAN NOT NULL DEFAULT false,
    "additionalBGCheck" BOOLEAN NOT NULL DEFAULT false,
    "desiredAlias" TEXT,
    "hardwareType" "HardwareType",
    "peripherals" JSONB,
    "deliveryMethod" "EquipmentDeliveryMethod",
    "businessReason" TEXT,
    "additionalInfo" TEXT,
    "equipmentPackageId" TEXT,
    "equipmentTrackingNumber" TEXT,
    "equipmentShippedAt" TIMESTAMP(3),
    "equipmentDeliveredAt" TIMESTAMP(3),
    "equipmentDeskLocation" TEXT,
    "equipmentSetupConfirmedAt" TIMESTAMP(3),
    "equipmentSetupConfirmedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PIFData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingMilestone" (
    "id" TEXT NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "milestone" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "completedById" TEXT,
    "escalatedAt" TIMESTAMP(3),
    "escalationSentToId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hardwareType" "HardwareType" NOT NULL,
    "peripherals" JSONB NOT NULL,
    "roleFamily" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidatePrework" (
    "id" TEXT NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "i9Status" "I9Status" NOT NULL DEFAULT 'I9_NOT_STARTED',
    "i9DocumentsReceivedAt" TIMESTAMP(3),
    "taxWithholdingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "companyPoliciesAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "directDepositSetup" BOOLEAN NOT NULL DEFAULT false,
    "emergencyContactsProvided" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsentSigned" BOOLEAN NOT NULL DEFAULT false,
    "tshirtSize" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidatePrework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessRequest" (
    "id" TEXT NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "requestedById" TEXT,
    "status" "AccessReqStatus" NOT NULL DEFAULT 'ACCESS_PENDING',

    CONSTRAINT "AccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingPlan" (
    "id" TEXT NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "meetingsToSchedule" JSONB,
    "trainingsRequired" JSONB,
    "firstWeekTasks" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractTracking" (
    "id" TEXT NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "starterFormType" TEXT,
    "managerSignedAt" TIMESTAMP(3),
    "candidateSignedAt" TIMESTAMP(3),
    "finalSignedAt" TIMESTAMP(3),
    "contractDocuSignId" TEXT,
    "starterFormDocuSignId" TEXT,
    "status" "ContractStatus" NOT NULL DEFAULT 'CONTRACT_DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalCompliance" (
    "id" TEXT NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "drugScreenRequired" BOOLEAN NOT NULL DEFAULT false,
    "drugScreenStatus" TEXT,
    "drugScreenCompletedAt" TIMESTAMP(3),
    "tbTestRequired" BOOLEAN NOT NULL DEFAULT false,
    "tbTestVisit1At" TIMESTAMP(3),
    "tbTestVisit2At" TIMESTAMP(3),
    "tbTestResult" TEXT,
    "vaccinations" JSONB,
    "concentraAuthSentAt" TIMESTAMP(3),
    "canStartWithPending" BOOLEAN NOT NULL DEFAULT false,
    "clearanceStatus" "MedicalClearance" NOT NULL DEFAULT 'MEDICAL_PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalCompliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternationalHireDetails" (
    "id" TEXT NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "globalUpsideNotified" BOOLEAN NOT NULL DEFAULT false,
    "noticePeriodDays" INTEGER,
    "probationMonths" INTEGER,
    "salaryBreakdown" JSONB,
    "businessUnit" TEXT,
    "positionIdFormat" TEXT,
    "payrollContactNotified" BOOLEAN NOT NULL DEFAULT false,
    "hmrcFormSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "standardHoursPerMonth" DOUBLE PRECISION,
    "timeOffPolicies" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternationalHireDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingRecord_candidateId_key" ON "OnboardingRecord"("candidateId");

-- CreateIndex
CREATE INDEX "OnboardingRecord_status_idx" ON "OnboardingRecord"("status");

-- CreateIndex
CREATE INDEX "OnboardingRecord_hireDate_idx" ON "OnboardingRecord"("hireDate");

-- CreateIndex
CREATE UNIQUE INDEX "PIFData_onboardingId_key" ON "PIFData"("onboardingId");

-- CreateIndex
CREATE INDEX "OnboardingMilestone_onboardingId_idx" ON "OnboardingMilestone"("onboardingId");

-- CreateIndex
CREATE INDEX "OnboardingMilestone_milestone_idx" ON "OnboardingMilestone"("milestone");

-- CreateIndex
CREATE INDEX "OnboardingMilestone_targetDate_idx" ON "OnboardingMilestone"("targetDate");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentPackage_name_key" ON "EquipmentPackage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CandidatePrework_onboardingId_key" ON "CandidatePrework"("onboardingId");

-- CreateIndex
CREATE INDEX "AccessRequest_onboardingId_idx" ON "AccessRequest"("onboardingId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingPlan_onboardingId_key" ON "OnboardingPlan"("onboardingId");

-- CreateIndex
CREATE UNIQUE INDEX "ContractTracking_onboardingId_key" ON "ContractTracking"("onboardingId");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalCompliance_onboardingId_key" ON "MedicalCompliance"("onboardingId");

-- CreateIndex
CREATE UNIQUE INDEX "InternationalHireDetails_onboardingId_key" ON "InternationalHireDetails"("onboardingId");

-- AddForeignKey
ALTER TABLE "OnboardingRecord" ADD CONSTRAINT "OnboardingRecord_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingRecord" ADD CONSTRAINT "OnboardingRecord_greeterAssignedToId_fkey" FOREIGN KEY ("greeterAssignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PIFData" ADD CONSTRAINT "PIFData_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "OnboardingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PIFData" ADD CONSTRAINT "PIFData_equipmentPackageId_fkey" FOREIGN KEY ("equipmentPackageId") REFERENCES "EquipmentPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PIFData" ADD CONSTRAINT "PIFData_equipmentSetupConfirmedById_fkey" FOREIGN KEY ("equipmentSetupConfirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingMilestone" ADD CONSTRAINT "OnboardingMilestone_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "OnboardingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingMilestone" ADD CONSTRAINT "OnboardingMilestone_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingMilestone" ADD CONSTRAINT "OnboardingMilestone_escalationSentToId_fkey" FOREIGN KEY ("escalationSentToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidatePrework" ADD CONSTRAINT "CandidatePrework_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "OnboardingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "OnboardingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingPlan" ADD CONSTRAINT "OnboardingPlan_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "OnboardingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractTracking" ADD CONSTRAINT "ContractTracking_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "OnboardingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalCompliance" ADD CONSTRAINT "MedicalCompliance_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "OnboardingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternationalHireDetails" ADD CONSTRAINT "InternationalHireDetails_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "OnboardingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
