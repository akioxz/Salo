// src/lib/wishCategory.ts
// Hardcoded category detection for wishlist items, used to pick a
// representative icon + accent tint for each card in the Balikbayan Box.
// No product photos — just enough visual signal to scan the grid fast.

import {
  Footprints,
  Shirt,
  Smartphone,
  Watch,
  Sparkles,
  Gamepad2,
  Cookie,
  Baby,
  Glasses,
  Backpack,
  Gift,
  type LucideIcon,
} from "lucide-react";

export type WishCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  // Tailwind classes for the small icon chip background/foreground.
  chipClass: string;
};

const CATEGORIES: Array<{ id: string; label: string; icon: LucideIcon; chipClass: string; keywords: string[] }> = [
  {
    id: "shoes",
    label: "Sapatos",
    icon: Footprints,
    chipClass: "bg-[#EFE6DA] text-[#8C6A46] dark:bg-[#3D3124] dark:text-[#D9C4A9]",
    keywords: ["sapatos", "shoes", "sneaker", "sneakers", "tsinelas", "slippers", "rubber shoes", "heels", "sandals", "boots"],
  },
  {
    id: "clothes",
    label: "Damit",
    icon: Shirt,
    chipClass: "bg-[#E4ECF2] text-[#3E6280] dark:bg-[#1C2A33] dark:text-[#8FB8D4]",
    keywords: ["damit", "clothes", "shirt", "t-shirt", "tshirt", "jacket", "jeans", "pants", "dress", "blouse", "polo", "uniform"],
  },
  {
    id: "electronics",
    label: "Gadget",
    icon: Smartphone,
    chipClass: "bg-[#EAE4F2] text-[#6B4F94] dark:bg-[#241C33] dark:text-[#B6A0D9]",
    keywords: ["phone", "cellphone", "gadget", "laptop", "tablet", "earbuds", "earphones", "charger", "powerbank", "camera", "console", "airpods"],
  },
  {
    id: "accessories",
    label: "Accessories",
    icon: Watch,
    chipClass: "bg-[#F2E4E4] text-[#8A4F4F] dark:bg-[#331C1C] dark:text-[#D9A0A0]",
    keywords: ["watch", "relo", "bag", "wallet", "belt", "jewelry", "ring", "necklace", "bracelet", "sunglasses"],
  },
  {
    id: "beauty",
    label: "Beauty",
    icon: Sparkles,
    chipClass: "bg-[#F2E4EE] text-[#8A4F76] dark:bg-[#331C2C] dark:text-[#D9A0C4]",
    keywords: ["makeup", "skincare", "perfume", "pabango", "lotion", "cosmetics", "shampoo", "sabon", "soap"],
  },
  {
    id: "toys",
    label: "Toys",
    icon: Gamepad2,
    chipClass: "bg-[#E4F2E8] text-[#4F8A62] dark:bg-[#1C3324] dark:text-[#A0D9B4]",
    keywords: ["toy", "toys", "laruan", "doll", "lego", "game", "video game"],
  },
  {
    id: "food",
    label: "Pasalubong",
    icon: Cookie,
    chipClass: "bg-[#F2ECE4] text-[#8A6F4F] dark:bg-[#332B1C] dark:text-[#D9C0A0]",
    keywords: ["food", "pasalubong", "chocolate", "candy", "snack", "biskwit", "biscuit"],
  },
  {
    id: "baby",
    label: "Bata",
    icon: Baby,
    chipClass: "bg-[#E4EEF2] text-[#4F7A8A] dark:bg-[#1C2B33] dark:text-[#A0C4D9]",
    keywords: ["baby", "diaper", "milk powder", "gatas", "formula", "bata"],
  },
  {
    id: "eyewear",
    label: "Eyewear",
    icon: Glasses,
    chipClass: "bg-[#EEF2E4] text-[#6F8A4F] dark:bg-[#2B331C] dark:text-[#C0D9A0]",
    keywords: ["salamin", "glasses", "eyeglasses", "contact lens"],
  },
  {
    id: "school",
    label: "School",
    icon: Backpack,
    chipClass: "bg-[#E4E9F2] text-[#4F6A8A] dark:bg-[#1C2433] dark:text-[#A0B8D9]",
    keywords: ["bag pack", "backpack", "school bag", "notebook", "school supplies"],
  },
];

const FALLBACK: WishCategory = {
  id: "other",
  label: "Wish",
  icon: Gift,
  chipClass: "bg-[#F4F4F5] text-[#787774] dark:bg-[#222222] dark:text-[#A1A1AA]",
};

/**
 * Guesses a category from the free-text wish title. Case-insensitive,
 * substring match against a hardcoded keyword list. First match wins —
 * order the CATEGORIES array by specificity if you add more.
 */
export function getWishCategory(title: string): WishCategory {
  const normalized = title.toLowerCase();
  for (const category of CATEGORIES) {
    if (category.keywords.some((kw) => normalized.includes(kw))) {
      return {
        id: category.id,
        label: category.label,
        icon: category.icon,
        chipClass: category.chipClass,
      };
    }
  }
  return FALLBACK;
}
