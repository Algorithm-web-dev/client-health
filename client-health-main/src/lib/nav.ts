import type { AppRole } from "@/hooks/useAuth";
import {
  LayoutGrid,
  ClipboardList,
  CheckCircle2,
  CalendarRange,
  Building2,
  Upload,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: AppRole[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutGrid, roles: ["ci", "director", "admin"] },
  { label: "Scoring wizard", to: "/wizard", icon: ClipboardList, roles: ["ci", "admin"] },
  { label: "Review", to: "/review", icon: CheckCircle2, roles: ["ci", "director", "admin"] },
  { label: "Cycles", to: "/cycles", icon: CalendarRange, roles: ["director", "admin"] },
  { label: "Clients", to: "/admin/clients", icon: Building2, roles: ["admin"] },
  { label: "Seed import", to: "/admin/import", icon: Upload, roles: ["admin"] },
];


export const ROLE_LABEL: Record<AppRole, string> = {
  ci: "Client Impact lead",
  director: "Director",
  admin: "Admin",
};

export function canAccess(role: AppRole | null, path: string) {
  const item = NAV_ITEMS.find((n) => n.to === path);
  if (!item) return true;
  return role !== null && item.roles.includes(role);
}
