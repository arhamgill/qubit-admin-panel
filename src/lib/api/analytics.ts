import { dailyRevenue } from "@/lib/mock/seed";
import type { DashboardStats, RevenuePoint, RevenueRange, RevenueSeries, UserRole } from "@/types";
import { REVENUE_RANGES } from "@/types";
import { ApiError, simulateLatency } from "./client";
import { readAllUsers } from "./users";

const DAY = 86_400_000;

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Sum of revenue for `count` days ending `offset` days before today (offset 0 = includes today). */
function sumDays(today: Date, count: number, offset: number) {
  let total = 0;
  for (let i = offset; i < offset + count; i++) total += dailyRevenue(addDays(today, -i));
  return total;
}

function sumMonth(year: number, month: number) {
  const days = new Date(year, month + 1, 0).getDate();
  let total = 0;
  for (let d = 1; d <= days; d++) total += dailyRevenue(new Date(year, month, d));
  return total;
}

const dayLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const monthLabel = new Intl.DateTimeFormat("en-US", { month: "short" });

export async function getRevenue(range: RevenueRange): Promise<RevenueSeries> {
  await simulateLatency(300, 650);
  if (!REVENUE_RANGES.includes(range)) throw new ApiError("Unknown range", 400);

  const today = startOfToday();
  const points: RevenuePoint[] = [];
  let previousTotal = 0;

  if (range === "12m") {
    // The 12 most recent *complete* months, so a partial current month doesn't look like a dip.
    for (let i = 12; i >= 1; i--) {
      const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
      points.push({
        date: start.toISOString(),
        label: monthLabel.format(start),
        revenue: sumMonth(start.getFullYear(), start.getMonth()),
      });
    }
    for (let i = 24; i >= 13; i--) {
      const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
      previousTotal += sumMonth(start.getFullYear(), start.getMonth());
    }
  } else {
    const days = range === "7d" ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const date = addDays(today, -i);
      points.push({ date: date.toISOString(), label: dayLabel.format(date), revenue: dailyRevenue(date) });
    }
    previousTotal = sumDays(today, days, days);
  }

  const total = points.reduce((sum, p) => sum + p.revenue, 0);
  return { range, points, total, previousTotal };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await simulateLatency();
  const users = readAllUsers();
  const today = startOfToday();
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * DAY;
  const sixtyDaysAgo = now - 60 * DAY;

  let newSignups30d = 0;
  let newSignupsPrev30d = 0;
  let activeUsers = 0;
  const roleBreakdown: Record<UserRole, number> = { admin: 0, editor: 0, viewer: 0 };

  for (const user of users) {
    const joined = new Date(user.joinedAt).getTime();
    if (joined >= thirtyDaysAgo) newSignups30d++;
    else if (joined >= sixtyDaysAgo) newSignupsPrev30d++;
    if (user.status === "active") activeUsers++;
    roleBreakdown[user.role]++;
  }

  const recentUsers = [...users].sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)).slice(0, 5);

  return {
    revenue30d: sumDays(today, 30, 0),
    revenuePrev30d: sumDays(today, 30, 30),
    totalUsers: users.length,
    usersAddedLast30d: newSignups30d,
    activeUsers,
    newSignups30d,
    newSignupsPrev30d,
    roleBreakdown,
    recentUsers,
  };
}
