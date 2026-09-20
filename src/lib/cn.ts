/**
 * Minimal classnames joiner so this kit has zero dependency on shadcn
 * scaffolding being present yet. If this project has already run
 * `shadcn init`, feel free to delete this and import `cn` from
 * "@/lib/utils" instead — same signature.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
