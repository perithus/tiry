import { NextResponse } from "next/server";
import { getAuditExportRows, parseAdminReportRange, toCsv } from "@/lib/admin/reports";
import { requireRole } from "@/lib/auth/permissions";

export async function GET(request: Request) {
  await requireRole("ADMIN");
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") === "security" ? "security" : "all";
  const format = searchParams.get("format") === "json" ? "json" : "csv";
  const range = parseAdminReportRange(searchParams.get("range"));
  const rows = await getAuditExportRows(scope, range);

  if (format === "json") {
    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      scope,
      range,
      rows
    });
  }

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="admin-audit-${scope}-${range}d.csv"`
    }
  });
}
