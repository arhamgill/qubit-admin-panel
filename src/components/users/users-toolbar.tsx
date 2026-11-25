"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/form-controls";
import type { UserQuery } from "@/types";

const ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "inactive", label: "Inactive" },
] as const;

interface UsersToolbarProps {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  role: UserQuery["role"];
  status: UserQuery["status"];
  onFilterChange: (patch: Pick<Partial<UserQuery>, "role" | "status">) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function UsersToolbar({
  searchText,
  onSearchTextChange,
  role,
  status,
  onFilterChange,
  hasActiveFilters,
  onClear,
}: UsersToolbarProps) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:px-5 md:flex-row md:items-center">
      <div className="relative flex-1">
        <label htmlFor="user-search" className="sr-only">
          Search users
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" strokeWidth={1.75} aria-hidden />
        <input
          id="user-search"
          type="search"
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          placeholder="Search by name, email or location…"
          maxLength={100}
          autoComplete="off"
          className="h-10 w-full rounded-lg bg-surface pr-3 pl-9 text-sm text-foreground shadow-sm ring-1 ring-line-strong ring-inset transition-[box-shadow] duration-200 ease-out placeholder:text-muted/80 hover:ring-muted/60 focus:shadow-[0_0_0_4px_var(--accent-soft)] focus:ring-[1.5px] focus:ring-accent focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 md:flex md:items-center">
        <SelectField
          label="Filter by role"
          hideLabel
          value={role}
          options={ROLE_OPTIONS}
          onChange={(e) => onFilterChange({ role: e.target.value as UserQuery["role"] })}
          wrapperClassName="md:w-40"
        />
        <SelectField
          label="Filter by status"
          hideLabel
          value={status}
          options={STATUS_OPTIONS}
          onChange={(e) => onFilterChange({ status: e.target.value as UserQuery["status"] })}
          wrapperClassName="md:w-40"
        />
      </div>
      {hasActiveFilters && (
        <Button variant="ghost" onClick={onClear} className="self-start md:self-auto">
          <X className="size-4" aria-hidden />
          Clear
        </Button>
      )}
    </div>
  );
}
