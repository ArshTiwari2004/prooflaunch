export interface UserView {
  id: number;
  displayName: string;
  email: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
}

export interface ProductSummary {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  logoUrl: string | null;
  categorySlug: string;
  categoryName: string;
  makerName: string;
  verifiedMaker: boolean;
  upvoteCount: number;
  tryStartedCount: number;
  tryCount: number;
  avgRating: number;
  upvotePoints: number;
  tryPoints: number;
  score: number;
  earnedDofollow: boolean;
  launchDate: string;
  viewerUpvoted: boolean;
  viewerTried: boolean;
}

export interface ProductDetail {
  product: ProductSummary;
  description: string | null;
  websiteUrl: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface FeedbackView {
  id: number;
  author: string;
  rating: number;
  feedback: string;
  completedAt: string;
}

export interface ViewerState {
  authenticated: boolean;
  owner: boolean;
  upvoted: boolean;
  tryStatus: "NONE" | "STARTED" | "COMPLETED";
  secondsRemaining: number;
  rating: number | null;
}

export interface EngagementResult {
  upvoted: boolean;
  upvoteCount: number;
  tryStartedCount: number;
  tryCount: number;
  avgRating: number;
  score: number;
}

export interface TryStartResponse {
  websiteUrl: string;
  minSeconds: number;
  status: string;
  secondsRemaining: number;
}

export interface SitemapEntry {
  slug: string;
  updatedAt: string;
}
