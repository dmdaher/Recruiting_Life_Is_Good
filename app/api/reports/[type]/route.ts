import { NextRequest, NextResponse } from "next/server";
import { success, notFound } from "@/lib/api/response";
import { generateOpenReqsReport, generateOpenReqsExcel } from "@/lib/reports/generators/open-reqs";
import { generateFilledPositionsReport, generateFilledPositionsExcel } from "@/lib/reports/generators/filled-positions";
import { generateYTDPerformanceReport, generateYTDPerformanceExcel } from "@/lib/reports/generators/ytd-performance";
import { generateAgencyFeesReport, generateAgencyFeesExcel } from "@/lib/reports/generators/agency-fees";
import { generateTimeToFillReport, generateTimeToFillExcel } from "@/lib/reports/generators/time-to-fill";

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
