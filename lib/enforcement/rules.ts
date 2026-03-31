import type { Candidate, BackgroundCheck, PipelineStage, Requisition } from "@/app/generated/prisma";

/**
 * Enforcement Rule 1: WA EPOA — Pay range required on all postings
 */
export function validatePayRange(req: Pick<Requisition, "payRangeMin" | "payRangeMax">) {
  if (req.payRangeMin == null || req.payRangeMax == null) {
    return {
      blocked: true,
      rule: "WA_EPOA_PAY_RANGE",
      message: "Pay range (min and max) is required on all job postings per Washington Equal Pay and Opportunities Act (RCW 49.58).",
    };
  }
  if (req.payRangeMin > req.payRangeMax) {
    return {
      blocked: true,
      rule: "WA_EPOA_PAY_RANGE",
      message: "Pay range minimum cannot exceed maximum.",
    };
  }
  return { blocked: false };
}

/**
 * Enforcement Rule 2: WA Fair Chance Act — Background check cannot initiate before Screen stage
 */
export function validateBackgroundCheckTiming(
  candidateStageOrder: number,
  screenStageOrder: number
) {
  if (candidateStageOrder < screenStageOrder) {
    return {
      blocked: true,
      rule: "WA_FAIR_CHANCE_ACT",
      message: "Background check cannot be initiated until candidate has passed the Screen stage (Washington Fair Chance Act, RCW 49.94).",
    };
  }
  return { blocked: false };
}

/**
 * Enforcement Rule 3: FCRA — Cannot reject after background check without adverse action workflow
 */
export function validateFCRAAdverseAction(
  backgroundCheck: Pick<BackgroundCheck, "preAdverseNoticeSentAt" | "waitingPeriodExpiresAt" | "adverseActionNoticeSentAt"> | null
) {
  if (!backgroundCheck) return { blocked: false };

  if (!backgroundCheck.preAdverseNoticeSentAt) {
    return {
      blocked: true,
      rule: "FCRA_ADVERSE_ACTION",
      message: "Pre-adverse action notice must be sent before rejecting a candidate with a background check on record (FCRA §604(b)(3)).",
    };
  }

  if (
    backgroundCheck.waitingPeriodExpiresAt &&
    new Date() < backgroundCheck.waitingPeriodExpiresAt
  ) {
    return {
      blocked: true,
      rule: "FCRA_WAITING_PERIOD",
      message: `5 business day waiting period has not elapsed. Expires ${backgroundCheck.waitingPeriodExpiresAt.toISOString().slice(0, 10)}.`,
    };
  }

  if (!backgroundCheck.adverseActionNoticeSentAt) {
    return {
      blocked: true,
      rule: "FCRA_ADVERSE_ACTION_NOTICE",
      message: "Adverse action notice must be sent before finalizing rejection (FCRA §615(a)).",
    };
  }

  return { blocked: false };
}

/**
 * Enforcement Rule 7: NDA before interview
 */
export function validateNDAForInterview(
  ndaStatus: string,
  ndaRequired: boolean
) {
  if (ndaRequired && ndaStatus !== "SIGNED") {
    return {
      blocked: true,
      rule: "NDA_REQUIRED",
      message: "NDA must be signed before scheduling an interview (per SOP). Send NDA via DocuSign first.",
    };
  }
  return { blocked: false };
}

/**
 * Enforcement Rule 6: Minimum wage validation (warning, not blocking for exempt)
 */
export function validateMinimumWage(
  payRate: number | null,
  jurisdiction: string | null,
  exemptStatus: string | null
): { warning: boolean; message?: string } {
  if (!payRate || !jurisdiction) return { warning: false };

  const minimumWages: Record<string, number> = {
    WA: 16.66,
    US: 7.25,
  };

  const applicableMin = minimumWages[jurisdiction] ?? minimumWages["US"];

  if (payRate < applicableMin) {
    return {
      warning: true,
      message: `Offered pay rate ($${payRate}/hr) is below ${jurisdiction} minimum wage ($${applicableMin}/hr).${
        exemptStatus === "exempt" ? " Note: position is marked exempt." : ""
      }`,
    };
  }
  return { warning: false };
}

/**
 * Enforcement Rule 8: Duplicate candidate detection
 */
export function checkDuplicateFields(
  firstName: string,
  lastName: string,
  email: string
) {
  return {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
  };
}
