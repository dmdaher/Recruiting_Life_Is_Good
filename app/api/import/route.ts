import { NextRequest } from "next/server";
import { success, validationError } from "@/lib/api/response";
import { parseExcelForPreview, executeImport, type ImportTemplate } from "@/lib/excel/importer";

const VALID_TEMPLATES: ImportTemplate[] = ["open-reqs", "filled-positions", "ytd-report"];

// POST /api/import — Upload Excel file for preview or import
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const template = formData.get("template") as ImportTemplate | null;
  const confirm = formData.get("confirm") === "true";

  if (!file) return validationError("No file uploaded");
  if (!template || !VALID_TEMPLATES.includes(template)) {
    return validationError(`Invalid template. Must be one of: ${VALID_TEMPLATES.join(", ")}`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!confirm) {
    // Preview mode
    const preview = await parseExcelForPreview(buffer, template);
    return success(preview);
  }

  // Execute import
  const preview = await parseExcelForPreview(buffer, template);
  const result = await executeImport(template, preview.data);
  return success(result);
}
