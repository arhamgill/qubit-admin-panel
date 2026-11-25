"use client";

import { DollarSign, UserCheck, UserPlus, Users } from "lucide-react";
import { ErrorState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { useApiQuery } from "@/hooks/use-api-query";
import { getDashboardStats } from "@/lib/api/analytics";
import { formatCurrency, formatNumber, percentChange } from "@/lib/utils";
import { RecentUsers } from "./recent-users";
import { RevenueChart } from "./revenue-chart";
import { StatCard, StatGrid } from "./stat-card";
import { UserBreakdown } from "./user-breakdown";

export function DashboardView() {
  const { data: stats, error, reload, isInitialLoading } = useApiQuery("dashboard-stats", getDashboardStats);

  const totalGrowth =
    stats && stats.totalUsers - stats.usersAddedLast30d > 0
      ? (stats.usersAddedLast30d / (stats.totalUsers - stats.usersAddedLast30d)) * 100
      : null;

  return (
    <>
      <PageHeader
        index="01"
        eyebrow="Overview"
        title="Dashboard"
        description="Revenue and user activity across your workspace, at a glance."
      />

      {error && !stats ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="space-y-5">
          <StatGrid label="Key metrics">
            <StatCard
              label="Revenue · 30d"
              icon={<DollarSign className="size-4" />}
              loading={isInitialLoading}
              value={stats && formatCurrency(stats.revenue30d)}
              delta={stats && percentChange(stats.revenue30d, stats.revenuePrev30d)}
              deltaLabel="vs previous 30 days"
            />
            <StatCard
              label="Total users"
              icon={<Users className="size-4" />}
              loading={isInitialLoading}
              value={stats && formatNumber(stats.totalUsers)}
              delta={totalGrowth}
              deltaLabel="growth in 30 days"
              hint="All registered accounts"
            />
            <StatCard
              label="Active users"
              icon={<UserCheck className="size-4" />}
              loading={isInitialLoading}
              value={stats && formatNumber(stats.activeUsers)}
              hint={stats ? `${Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}% of all users` : undefined}
            />
            <StatCard
              label="New sign-ups · 30d"
              icon={<UserPlus className="size-4" />}
              loading={isInitialLoading}
              value={stats && formatNumber(stats.newSignups30d)}
              delta={stats && percentChange(stats.newSignups30d, stats.newSignupsPrev30d)}
              deltaLabel="vs previous 30 days"
              hint="No sign-ups in the previous period"
            />
          </StatGrid>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RevenueChart />
            </div>
            <UserBreakdown
              breakdown={stats?.roleBreakdown}
              total={stats?.totalUsers}
              activeUsers={stats?.activeUsers}
            />
          </div>

          <RecentUsers users={stats?.recentUsers} />
        </div>
      )}
    </>
  );
}
