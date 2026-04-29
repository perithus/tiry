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

export function getNotificationsHref(user: Pick<SessionUser, "role">) {
  switch (user.role) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin/notifications";
    case "CARRIER_OWNER":
    case "FLEET_MANAGER":
      return "/fleet/notifications";
    case "ADVERTISER":
    default:
      return "/advertiser/notifications";
  }
}

export function getSearchHref(user: Pick<SessionUser, "role">) {
  switch (user.role) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin/search";
    case "CARRIER_OWNER":
    case "FLEET_MANAGER":
      return "/fleet/search";
    case "ADVERTISER":
    default:
      return "/advertiser/search";
  }
}
