import { NextResponse } from "next/server";
import { getAdminReportSnapshot, getAdminReportSummaryRows, parseAdminReportRange, toCsv } from "@/lib/admin/reports";
import { requireRole } from "@/lib/auth/permissions";

export async function GET(request: Request) {
  await requireRole("ADMIN");
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "json" ? "json" : "csv";
  const range = parseAdminReportRange(searchParams.get("range"));
  const snapshot = await getAdminReportSnapshot(range);

  if (format === "json") {
    return NextResponse.json(snapshot);
  }

  return new NextResponse(toCsv(getAdminReportSummaryRows(snapshot)), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="admin-report-summary-${range}d.csv"`
    }
  });
}
