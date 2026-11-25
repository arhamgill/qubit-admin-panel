export const USER_ROLES = ["admin", "editor", "viewer"] as const;
export const USER_STATUSES = ["active", "pending", "inactive"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  location: string;
  joinedAt: string; // ISO date
  lastActiveAt: string; // ISO date
}

export type UserInput = Pick<User, "name" | "email" | "role" | "status" | "location">;

export const SORT_FIELDS = ["name", "role", "status", "joinedAt"] as const;
export type SortField = (typeof SORT_FIELDS)[number];
export type SortDirection = "asc" | "desc";

export interface UserQuery {
  search: string;
  role: UserRole | "all";
  status: UserStatus | "all";
  sort: SortField;
  dir: SortDirection;
  page: number;
  pageSize: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const REVENUE_RANGES = ["7d", "30d", "12m"] as const;
export type RevenueRange = (typeof REVENUE_RANGES)[number];

export interface RevenuePoint {
  /** ISO date of the bucket start */
  date: string;
  /** Short axis label, e.g. "Mar 4" or "Mar" */
  label: string;
  revenue: number;
}

export interface RevenueSeries {
  range: RevenueRange;
  points: RevenuePoint[];
  total: number;
  previousTotal: number;
}

export interface DashboardStats {
  revenue30d: number;
  revenuePrev30d: number;
  totalUsers: number;
  usersAddedLast30d: number;
  activeUsers: number;
  newSignups30d: number;
  newSignupsPrev30d: number;
  roleBreakdown: Record<UserRole, number>;
  recentUsers: User[];
}

export interface Profile {
  name: string;
  email: string;
  jobTitle: string;
  phone: string;
  location: string;
  bio: string;
}

export interface NotificationSettings {
  productUpdates: boolean;
  weeklyReport: boolean;
  securityAlerts: boolean;
  newUserSignups: boolean;
}

export interface Settings {
  notifications: NotificationSettings;
  timezone: string;
}

export type ThemePreference = "light" | "dark" | "system";
