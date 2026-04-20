import { UserRole } from "@prisma/client";

export const SESSION_COOKIE_NAME = "tiy_session";

export const roleLabels: Record<UserRole, string> = {
  ADVERTISER: "Advertiser",
  CARRIER_OWNER: "Carrier owner",
  FLEET_MANAGER: "Fleet manager",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super admin"
};

export const dashboardHomeByRole: Partial<Record<UserRole, string>> = {
  ADVERTISER: "/advertiser",
  CARRIER_OWNER: "/fleet",
  FLEET_MANAGER: "/fleet",
  ADMIN: "/admin",
  SUPER_ADMIN: "/admin"
};
