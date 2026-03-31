import ExcelJS from "exceljs";

const DENALI_CYAN = "00C9FF";
const DENALI_DARK = "0A0A0A";
const HEADER_BG = "1A1A1A";
const BORDER_COLOR = "404040";

export type ColumnDef = {
  header: string;
  key: string;
  width?: number;
  format?: "text" | "number" | "currency" | "date" | "percentage";
};

export async function createBrandedWorkbook(
  title: string,
  columns: ColumnDef[],
  rows: Record<string, unknown>[],
  options?: { sheetName?: string; subtitle?: string }
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Denali Recruiting Platform";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(options?.sheetName ?? "Report");

  // Title row
  sheet.mergeCells(1, 1, 1, columns.length);
  const titleCell = sheet.getCell("A1");
  titleCell.value = `DENALI — ${title}`;
  titleCell.font = { size: 14, bold: true, color: { argb: DENALI_CYAN } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DENALI_DARK } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(1).height = 32;

  // Subtitle/date row
  sheet.mergeCells(2, 1, 2, columns.length);
  const subtitleCell = sheet.getCell("A2");
  subtitleCell.value = options?.subtitle ?? `Generated: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;
  subtitleCell.font = { size: 9, color: { argb: "737373" } };
  subtitleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DENALI_DARK } };
  sheet.getRow(2).height = 20;

  // Empty row
  sheet.getRow(3).height = 8;

  // Header row (row 4)
  const headerRow = sheet.getRow(4);
  columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = { size: 10, bold: true, color: { argb: "FFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
    cell.alignment = { vertical: "middle", horizontal: col.format === "number" || col.format === "currency" || col.format === "percentage" ? "right" : "left" };
    cell.border = {
      bottom: { style: "thin", color: { argb: DENALI_CYAN } },
    };
    sheet.getColumn(i + 1).width = col.width ?? 18;
  });
  headerRow.height = 28;

  // Data rows (starting at row 5)
  rows.forEach((row, rowIndex) => {
    const excelRow = sheet.getRow(rowIndex + 5);
    columns.forEach((col, colIndex) => {
      const cell = excelRow.getCell(colIndex + 1);
      const value = row[col.key];

      if (value === null || value === undefined) {
        cell.value = "";
      } else if (col.format === "currency" && typeof value === "number") {
        cell.value = value;
        cell.numFmt = "$#,##0.00";
      } else if (col.format === "percentage" && typeof value === "number") {
        cell.value = value / 100;
        cell.numFmt = "0%";
      } else if (col.format === "date" && value instanceof Date) {
        cell.value = value;
        cell.numFmt = "MM/DD/YYYY";
      } else if (col.format === "date" && typeof value === "string") {
        cell.value = new Date(value);
        cell.numFmt = "MM/DD/YYYY";
      } else {
        cell.value = value as string | number;
      }

      cell.font = { size: 10, color: { argb: "E5E5E5" } };
      cell.alignment = { vertical: "middle", horizontal: col.format === "number" || col.format === "currency" || col.format === "percentage" ? "right" : "left" };

      // Alternating row colors
      if (rowIndex % 2 === 0) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "171717" } };
      } else {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0A0A0A" } };
      }

      cell.border = {
        bottom: { style: "hair", color: { argb: BORDER_COLOR } },
      };
    });
    excelRow.height = 22;
  });

  // Summary row at bottom
  const summaryRowNum = rows.length + 6;
  sheet.mergeCells(summaryRowNum, 1, summaryRowNum, columns.length);
  const summaryCell = sheet.getCell(summaryRowNum, 1);
  summaryCell.value = `Total records: ${rows.length}`;
  summaryCell.font = { size: 9, italic: true, color: { argb: "737373" } };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
