import ExcelJS from "exceljs";
import { prisma } from "@/lib/db/client";

export type ImportTemplate = "open-reqs" | "filled-positions" | "ytd-report";

export type ImportPreview = {
  template: ImportTemplate;
  totalRows: number;
  validRows: number;
  issues: { row: number; field: string; message: string; severity: "error" | "warning" }[];
  data: Record<string, unknown>[];
};

export type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

/**
 * Parse an Excel file and return a preview of what would be imported.
 */
export async function parseExcelForPreview(
  buffer: Buffer,
  template: ImportTemplate
): Promise<ImportPreview> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { template, totalRows: 0, validRows: 0, issues: [{ row: 0, field: "", message: "No worksheets found in file", severity: "error" }], data: [] };
  }

  const issues: ImportPreview["issues"] = [];
  const data: Record<string, unknown>[] = [];

  // Get headers from first row
  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = String(cell.value ?? "").trim().toLowerCase();
  });

  // Parse data rows
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const rowData: Record<string, unknown> = {};
    let hasData = false;

    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber];
      if (header) {
        rowData[header] = cell.value;
        if (cell.value !== null && cell.value !== undefined && cell.value !== "") {
          hasData = true;
        }
      }
    });

    if (hasData) {
      rowData._rowNumber = rowNumber;
      data.push(rowData);
    }
  });

  // Template-specific validation
  if (template === "open-reqs") {
    for (const row of data) {
      const rowNum = row._rowNumber as number;
      if (!row["req #"] && !row["req#"] && !row["requisition"]) {
        issues.push({ row: rowNum, field: "req#", message: "Missing requisition number", severity: "error" });
      }
      if (!row["title"] && !row["position title"]) {
        issues.push({ row: rowNum, field: "title", message: "Missing position title", severity: "warning" });
      }
    }
  }

  if (template === "filled-positions") {
    const seen = new Set<string>();
    for (const row of data) {
      const rowNum = row._rowNumber as number;
      const key = `${row["name"] ?? row["employee"]}|${row["title"] ?? row["position"]}|${row["date"] ?? row["hire date"]}`;
      if (seen.has(key)) {
        issues.push({ row: rowNum, field: "duplicate", message: `Duplicate row detected: ${key}`, severity: "warning" });
      }
      seen.add(key);
    }
  }

  const validRows = data.length - issues.filter((i) => i.severity === "error").length;

  return { template, totalRows: data.length, validRows, issues, data };
}

/**
 * Execute an import from parsed data. Wrapped in a transaction — all or nothing.
 */
export async function executeImport(
  template: ImportTemplate,
  data: Record<string, unknown>[]
): Promise<ImportResult> {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  try {
    await prisma.$transaction(async (tx) => {
      for (const row of data) {
        try {
          if (template === "open-reqs") {
            const reqNumber = String(row["req #"] ?? row["req#"] ?? row["requisition"] ?? "").trim();
            if (!reqNumber) { skipped++; continue; }

            const existing = await tx.requisition.findUnique({ where: { reqNumber } });
            if (existing) { skipped++; continue; }

            // Find or use defaults for FK references
            const dept = await tx.department.findFirst({ where: { name: { contains: String(row["department"] ?? "") } } });
            const loc = await tx.location.findFirst({ where: { name: { contains: String(row["location"] ?? "Washington") } } });
            const hm = await tx.user.findFirst({ where: { role: "HIRING_MANAGER" } });

            if (!dept || !loc || !hm) { skipped++; continue; }

            await tx.requisition.create({
              data: {
                reqNumber,
                title: String(row["title"] ?? row["position title"] ?? "Untitled"),
                departmentId: dept.id,
                locationId: loc.id,
                hiringManagerId: hm.id,
                status: "OPEN",
                payRangeMin: 0,
                payRangeMax: 0,
              },
            });
            imported++;
          }

          if (template === "filled-positions") {
            const name = String(row["name"] ?? row["employee"] ?? "").trim();
            if (!name) { skipped++; continue; }

            const [firstName, ...lastParts] = name.split(" ");
            const lastName = lastParts.join(" ") || "Unknown";

            const hiredStage = await tx.pipelineStage.findFirst({ where: { isTerminal: true } });
            const req = await tx.requisition.findFirst();
            if (!hiredStage || !req) { skipped++; continue; }

            // Check for duplicate
            const existing = await tx.candidate.findFirst({
              where: { firstName, lastName, requisitionId: req.id },
            });
            if (existing) { skipped++; continue; }

            await tx.candidate.create({
              data: {
                firstName,
                lastName,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, "")}@imported.denali`,
                requisitionId: req.id,
                currentStageId: hiredStage.id,
                jurisdiction: "WA",
              },
            });
            imported++;
          }
        } catch (err) {
          errors.push(`Row ${row._rowNumber}: ${err instanceof Error ? err.message : "Unknown error"}`);
          skipped++;
        }
      }
    });
  } catch (err) {
    return {
      imported: 0,
      skipped: data.length,
      errors: [`Transaction failed: ${err instanceof Error ? err.message : "Unknown error"}. No records were imported.`],
    };
  }

  return { imported, skipped, errors };
}
