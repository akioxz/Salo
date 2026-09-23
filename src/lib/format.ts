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

export const ROLE_STYLES: Record<
  HouseholdRole,
  { label: string; avatarBg: string; avatarText: string; bubbleBg: string }
> = {
  ofw: {
    label: "OFW",
    avatarBg: "bg-[#E1F3FE]",
    avatarText: "text-[#1F6C9F]",
    bubbleBg: "bg-[#E1F3FE]/50",
  },
  family: {
    label: "Family",
    avatarBg: "bg-[#FBF3DB]",
    avatarText: "text-[#956400]",
    bubbleBg: "bg-[#FBF3DB]/50",
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

export function stripEmojis(str?: string): string {
  if (!str) return "";
  return str.replace(/\p{Extended_Pictographic}/gu, "").trim();
}

