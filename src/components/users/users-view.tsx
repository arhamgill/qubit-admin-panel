"use client";

import { SearchX, UserPlus, Users } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { useApiQuery } from "@/hooks/use-api-query";
import { getErrorMessage } from "@/lib/api/client";
import { deleteUser, listUsers } from "@/lib/api/users";
import { userQuerySchema } from "@/lib/validation";
import type { SortField, User, UserQuery } from "@/types";
import { UserFormDialog } from "./user-form-dialog";
import { UsersTable, UsersTableSkeleton } from "./users-table";
import { UsersToolbar } from "./users-toolbar";

const DEFAULT_QUERY = userQuerySchema.parse({});
const SEARCH_DEBOUNCE_MS = 300;

type FormTarget = { mode: "create" } | { mode: "edit"; user: User } | null;

export function UsersView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();

  // The URL is the source of truth for search, filters, sorting and paging.
  const query = useMemo(() => userQuerySchema.parse(Object.fromEntries(searchParams)), [searchParams]);

  const { data, error, isLoading, isInitialLoading, reload } = useApiQuery(`users:${JSON.stringify(query)}`, () =>
    listUsers(query),
  );

  const updateQuery = useCallback(
    (patch: Partial<UserQuery>) => {
      const next: UserQuery = { ...query, ...patch };
      const params = new URLSearchParams();
      (Object.keys(next) as (keyof UserQuery)[]).forEach((key) => {
        if (next[key] !== DEFAULT_QUERY[key]) params.set(key, String(next[key]));
      });
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [query, pathname, router],
  );

  // Search box: local state for instant typing, debounced into the URL.
  const [searchText, setSearchText] = useState(query.search);
  useEffect(() => {
    const trimmed = searchText.trim();
    if (trimmed === query.search) return;
    const timer = setTimeout(() => updateQuery({ search: trimmed, page: 1 }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText, query.search, updateQuery]);

  // If the requested page no longer exists (e.g. after deleting the last row), snap to the last valid page.
  useEffect(() => {
    if (data && !isLoading && data.page !== query.page) updateQuery({ page: data.page });
  }, [data, isLoading, query.page, updateQuery]);

  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const hasActiveFilters = query.search !== "" || query.role !== "all" || query.status !== "all";

  function clearFilters() {
    setSearchText("");
    updateQuery({ search: "", role: "all", status: "all", page: 1 });
  }

  function handleSort(field: SortField) {
    const dir = query.sort === field && query.dir === "asc" ? "desc" : "asc";
    updateQuery({ sort: field, dir, page: 1 });
  }

  function handleSaved(user: User, mode: "create" | "edit") {
    setFormTarget(null);
    toast({
      title: mode === "create" ? "User added" : "Changes saved",
      description: mode === "create" ? `${user.name} has been added.` : `${user.name}'s details were updated.`,
    });
    reload();
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      toast({ title: "User deleted", description: `${deleteTarget.name} has been removed.` });
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast({ title: "Couldn't delete user", description: getErrorMessage(err), variant: "error" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Users"
        description="Search, filter and manage everyone with access to your workspace."
        actions={
          <Button onClick={() => setFormTarget({ mode: "create" })}>
            <UserPlus className="size-4" aria-hidden />
            Add user
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <UsersToolbar
          searchText={searchText}
          onSearchTextChange={setSearchText}
          role={query.role}
          status={query.status}
          onFilterChange={(patch) => updateQuery({ ...patch, page: 1 })}
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
        />

        <p className="sr-only" aria-live="polite">
          {data && !isLoading ? `${data.total} users found` : ""}
        </p>

        {error && !data ? (
          <ErrorState message={error} onRetry={reload} />
        ) : isInitialLoading || !data ? (
          <UsersTableSkeleton />
        ) : data.total === 0 ? (
          <div className="border-t border-line">
            {hasActiveFilters ? (
              <EmptyState
                icon={<SearchX className="size-5" aria-hidden />}
                title="No users match your filters"
                description="Try a different search term or clear the filters."
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<Users className="size-5" aria-hidden />}
                title="No users yet"
                description="Add your first team member to get started."
                action={<Button onClick={() => setFormTarget({ mode: "create" })}>Add user</Button>}
              />
            )}
          </div>
        ) : (
          <>
            <UsersTable
              users={data.data}
              loading={isLoading}
              sort={query.sort}
              dir={query.dir}
              onSort={handleSort}
              onEdit={(user) => setFormTarget({ mode: "edit", user })}
              onDelete={setDeleteTarget}
            />
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              pageSize={data.pageSize}
              onPageChange={(page) => updateQuery({ page })}
              onPageSizeChange={(pageSize) => updateQuery({ pageSize, page: 1 })}
            />
          </>
        )}
      </Card>

      <UserFormDialog
        open={formTarget !== null}
        user={formTarget?.mode === "edit" ? formTarget.user : null}
        onClose={() => setFormTarget(null)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete user?"
        description={
          deleteTarget
            ? `${deleteTarget.name} (${deleteTarget.email}) will lose access immediately. This can't be undone.`
            : ""
        }
        confirmLabel="Delete user"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
