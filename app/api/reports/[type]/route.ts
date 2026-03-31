import { NextRequest, NextResponse } from "next/server";
import { success, notFound } from "@/lib/api/response";
import { generateOpenReqsReport, generateOpenReqsExcel } from "@/lib/reports/generators/open-reqs";
import { generateFilledPositionsReport, generateFilledPositionsExcel } from "@/lib/reports/generators/filled-positions";
import { generateYTDPerformanceReport, generateYTDPerformanceExcel } from "@/lib/reports/generators/ytd-performance";
import { generateAgencyFeesReport, generateAgencyFeesExcel } from "@/lib/reports/generators/agency-fees";
import { generateTimeToFillReport, generateTimeToFillExcel } from "@/lib/reports/generators/time-to-fill";
import { generateDailyRecruitingReport, generateDailyRecruitingExcel } from "@/lib/reports/generators/daily-recruiting";
import { generateInterviewTrackingReport, generateInterviewTrackingExcel } from "@/lib/reports/generators/interview-tracking";
import { generateRescindedOffersReport, generateRescindedOffersExcel } from "@/lib/reports/generators/rescinded-offers";
import { generatePIRReport, generatePIRExcel } from "@/lib/reports/generators/pir";
import { generateCostPerHireReport, generateCostPerHireExcel } from "@/lib/reports/generators/cost-per-hire";
import { generateReferralBonusReport, generateReferralBonusExcel } from "@/lib/reports/generators/referral-bonus";
import { generateReqAuditReport, generateReqAuditExcel } from "@/lib/reports/generators/req-audit";

type ReportGenerator = {
  json: (filters?: Record<string, string>) => Promise<{ rows: unknown[]; columns: unknown[]; title: string }>;
  excel: (filters?: Record<string, string>) => Promise<Buffer>;
};

const generators: Record<string, ReportGenerator> = {
  "open-reqs": { json: generateOpenReqsReport, excel: generateOpenReqsExcel },
  "filled-positions": { json: generateFilledPositionsReport, excel: generateFilledPositionsExcel },
  "ytd-performance": { json: generateYTDPerformanceReport, excel: generateYTDPerformanceExcel },
  "agency-fees": { json: generateAgencyFeesReport, excel: generateAgencyFeesExcel },
  "time-to-fill": { json: generateTimeToFillReport, excel: generateTimeToFillExcel },
  "daily-recruiting": { json: generateDailyRecruitingReport, excel: generateDailyRecruitingExcel },
  "interview-tracking": { json: generateInterviewTrackingReport, excel: generateInterviewTrackingExcel },
  "rescinded-offers": { json: generateRescindedOffersReport, excel: generateRescindedOffersExcel },
  "pir": { json: generatePIRReport, excel: generatePIRExcel },
  "cost-per-hire": { json: generateCostPerHireReport, excel: generateCostPerHireExcel },
  "referral-bonus": { json: generateReferralBonusReport, excel: generateReferralBonusExcel },
  "req-audit": { json: generateReqAuditReport, excel: generateReqAuditExcel },
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const generator = generators[type];

  if (!generator) {
    return notFound(`Report type "${type}". Available: ${Object.keys(generators).join(", ")}`);
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "json";
  const filters: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== "format") filters[key] = value;
  });

  if (format === "excel" || format === "xlsx") {
    const buffer = await generator.excel(filters);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="denali-${type}-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  }

  const data = await generator.json(filters);
  return success(data);
}
