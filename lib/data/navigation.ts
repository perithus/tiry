import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Bell,
  Building2,
  CircleHelp,
  FileClock,
  Home,
  LayoutDashboard,
  Mail,
  Map,
  MessageSquare,
  Search,
  Settings,
  Shield,
  Sheet,
  Truck,
  Users
} from "lucide-react";
import type { Locale } from "@/lib/i18n/shared";
import { getMessages } from "@/lib/i18n/messages";

export type NavItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
};

export const marketingNav: NavItem[] = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/advertisers", label: "For advertisers" },
  { href: "/transport-companies", label: "For transport companies" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" }
];

export const advertiserNav: NavItem[] = [
  { href: "/advertiser", label: "Overview", icon: LayoutDashboard },
  { href: "/advertiser/saved-listings", label: "Saved listings", icon: Search },
  { href: "/advertiser/inquiries", label: "Inquiries", icon: FileClock },
  { href: "/advertiser/messages", label: "Messages", icon: MessageSquare },
  { href: "/advertiser/notifications", label: "Notifications", icon: Bell },
  { href: "/advertiser/campaigns", label: "Campaigns", icon: Map },
  { href: "/advertiser/security", label: "Security", icon: Shield },
  { href: "/advertiser/settings", label: "Settings", icon: Settings }
];

export const fleetNav: NavItem[] = [
  { href: "/fleet", label: "Overview", icon: Home },
  { href: "/fleet/company", label: "Company profile", icon: Building2 },
  { href: "/fleet/vehicles", label: "Vehicles", icon: Truck },
  { href: "/fleet/listings", label: "Listings", icon: Search },
  { href: "/fleet/availability", label: "Availability", icon: Map },
  { href: "/fleet/inquiries", label: "Inquiries", icon: Mail },
  { href: "/fleet/messages", label: "Messages", icon: MessageSquare },
  { href: "/fleet/notifications", label: "Notifications", icon: Bell },
  { href: "/fleet/campaigns", label: "Campaigns", icon: Map },
  { href: "/fleet/verification", label: "Verification", icon: BadgeCheck },
  { href: "/fleet/security", label: "Security", icon: Shield },
  { href: "/fleet/settings", label: "Settings", icon: Settings }
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/verifications", label: "Verifications", icon: BadgeCheck },
  { href: "/admin/listings", label: "Listings", icon: Search },
  { href: "/admin/inquiries", label: "Inquiries", icon: FileClock },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/campaigns", label: "Campaigns", icon: Map },
  { href: "/admin/security", label: "Security", icon: Shield },
  { href: "/admin/reports", label: "Reports", icon: Sheet },
  { href: "/admin/audit-logs", label: "Audit logs", icon: Shield },
  { href: "/admin/content", label: "Content", icon: CircleHelp }
];

export function getAdvertiserNav(locale: Locale): NavItem[] {
  const t = getMessages(locale);

  return [
    { href: "/advertiser", label: t.dashboard.nav.overview, icon: LayoutDashboard },
    { href: "/advertiser/saved-listings", label: t.dashboard.nav.savedListings, icon: Search },
    { href: "/advertiser/inquiries", label: t.dashboard.nav.inquiries, icon: FileClock },
    { href: "/advertiser/messages", label: t.dashboard.nav.messages, icon: MessageSquare },
    { href: "/advertiser/notifications", label: t.dashboard.nav.notifications, icon: Bell },
    { href: "/advertiser/campaigns", label: t.dashboard.nav.campaigns, icon: Map },
    { href: "/advertiser/security", label: t.dashboard.nav.security, icon: Shield },
    { href: "/advertiser/settings", label: t.dashboard.nav.settings, icon: Settings }
  ];
}

export function getFleetNav(locale: Locale): NavItem[] {
  const t = getMessages(locale);

  return [
    { href: "/fleet", label: t.dashboard.nav.overview, icon: Home },
    { href: "/fleet/company", label: t.dashboard.nav.companyProfile, icon: Building2 },
    { href: "/fleet/vehicles", label: t.dashboard.nav.vehicles, icon: Truck },
    { href: "/fleet/listings", label: t.dashboard.nav.listings, icon: Search },
    { href: "/fleet/availability", label: t.dashboard.nav.availability, icon: Map },
    { href: "/fleet/inquiries", label: t.dashboard.nav.inquiries, icon: Mail },
    { href: "/fleet/messages", label: t.dashboard.nav.messages, icon: MessageSquare },
    { href: "/fleet/notifications", label: t.dashboard.nav.notifications, icon: Bell },
    { href: "/fleet/campaigns", label: t.dashboard.nav.campaigns, icon: Map },
    { href: "/fleet/verification", label: t.dashboard.nav.verification, icon: BadgeCheck },
    { href: "/fleet/security", label: t.dashboard.nav.security, icon: Shield },
    { href: "/fleet/settings", label: t.dashboard.nav.settings, icon: Settings }
  ];
}

export function getAdminNav(locale: Locale): NavItem[] {
  const t = getMessages(locale);

  return [
    { href: "/admin", label: t.dashboard.nav.overview, icon: LayoutDashboard },
    { href: "/admin/users", label: t.dashboard.nav.users, icon: Users },
    { href: "/admin/verifications", label: t.dashboard.nav.verifications, icon: BadgeCheck },
    { href: "/admin/listings", label: t.dashboard.nav.listings, icon: Search },
    { href: "/admin/inquiries", label: t.dashboard.nav.inquiries, icon: FileClock },
    { href: "/admin/messages", label: t.dashboard.nav.messages, icon: MessageSquare },
    { href: "/admin/notifications", label: t.dashboard.nav.notifications, icon: Bell },
    { href: "/admin/campaigns", label: t.dashboard.nav.campaigns, icon: Map },
    { href: "/admin/security", label: t.dashboard.nav.security, icon: Shield },
    { href: "/admin/reports", label: t.dashboard.nav.reports, icon: Sheet },
    { href: "/admin/audit-logs", label: t.dashboard.nav.auditLogs, icon: Shield },
    { href: "/admin/content", label: t.dashboard.nav.content, icon: CircleHelp }
  ];
}
