import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

const roleWeight: Record<UserRole, number> = {
  ADVERTISER: 10,
  FLEET_MANAGER: 20,
  CARRIER_OWNER: 30,
  ADMIN: 40,
  SUPER_ADMIN: 50
};

export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole | keyof typeof roleWeight) {
  return roleWeight[userRole] >= roleWeight[requiredRole as UserRole];
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireRole(requiredRole: UserRole | keyof typeof roleWeight) {
  const session = await requireSession();
  if (!hasMinimumRole(session.user.role, requiredRole)) {
    redirect("/sign-in");
  }

  return session;
}
