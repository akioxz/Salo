export type HouseholdRole = "ofw" | "family";
export type PostType = "expense" | "need";

export interface HouseholdMember {
  name: string;
  role: HouseholdRole;
}

export interface HouseholdComment {
  id: string;
  author: HouseholdMember;
  /** ISO timestamp */
  createdAt: string;
  content: string;
}

export interface HouseholdPost {
  id: string;
  type: PostType;
  author: HouseholdMember;
  /** ISO timestamp */
  createdAt: string;
  content: string;
  category?: string;
  /** In PHP. Omit for a need post with no attached amount. */
  amount?: number;
  photoUrl?: string;
  reactionCount: number;
  hasReacted?: boolean;
  /**
   * Omit entirely if comments haven't been fetched yet for this post
   * (the feed will fall back to showing commentCount only, and expand
   * to a live thread once your onComment handler loads the real list).
   */
  comments?: HouseholdComment[];
  commentCount: number;
}
