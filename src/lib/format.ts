import {
  ShoppingCart,
  GraduationCap,
  Zap,
  HeartHandshake,
  Tag,
  type LucideIcon,
} from "lucide-react";
import type { HouseholdRole } from "@/types/household";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Groceries: ShoppingCart,
  Education: GraduationCap,
  Utilities: Zap,
  Family: HeartHandshake,
};

export function getCategoryIcon(category?: string): LucideIcon {
  if (!category) return Tag;
  return CATEGORY_ICONS[category] ?? Tag;
}

/**
 * Role color split is grounded in the product's subject, not decorative:
 * sky/blue for the OFW (across the ocean), amber for the family at home
 * (hearth, warmth).
 */
export const ROLE_STYLES: Record<
  HouseholdRole,
  { label: string; avatarBg: string; avatarText: string; bubbleBg: string }
> = {
  ofw: {
    label: "OFW",
    avatarBg: "bg-sky-500/15 dark:bg-sky-400/15",
    avatarText: "text-sky-600 dark:text-sky-300",
    bubbleBg: "bg-sky-500/[0.06] dark:bg-sky-400/[0.07]",
  },
  family: {
    label: "Family",
    avatarBg: "bg-amber-500/15 dark:bg-amber-400/15",
    avatarText: "text-amber-600 dark:text-amber-300",
    bubbleBg: "bg-amber-500/[0.06] dark:bg-amber-400/[0.07]",
  },
};

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
