import { NextResponse } from "next/server";
import { getDataExportRows, parseAdminReportRange, parseDataExportEntity, toCsv } from "@/lib/admin/reports";
import { requireRole } from "@/lib/auth/permissions";

export async function GET(request: Request) {
  await requireRole("ADMIN");
  const { searchParams } = new URL(request.url);
  const entity = parseDataExportEntity(searchParams.get("entity"));
  const format = searchParams.get("format") === "json" ? "json" : "csv";
  const range = parseAdminReportRange(searchParams.get("range"));
  const rows = await getDataExportRows(entity, range);

  if (format === "json") {
    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      entity,
      range,
      rows
    });
  }

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="admin-${entity}-${range}d.csv"`
    }
  });
}
