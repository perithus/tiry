import type { SessionUser } from "@/lib/auth/session";

export function getDashboardHref(user: Pick<SessionUser, "role">) {
  switch (user.role) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin";
    case "CARRIER_OWNER":
    case "FLEET_MANAGER":
      return "/fleet";
    case "ADVERTISER":
    default:
      return "/advertiser";
  }
}
