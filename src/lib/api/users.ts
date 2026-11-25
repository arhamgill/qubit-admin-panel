import { z } from "zod";
import { createSeedUsers } from "@/lib/mock/seed";
import { readJson, writeJson } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { toFieldErrors, userInputSchema, userQuerySchema, userSchema } from "@/lib/validation";
import type { Paginated, User, UserQuery } from "@/types";
import { ApiError, simulateLatency } from "./client";

const USERS_KEY = "v1:users";
/** Hard cap so the demo can't grow localStorage without bound. */
export const MAX_USERS = 500;

const storedListSchema = z.array(z.unknown()).max(MAX_USERS);

function reseed(): User[] {
  const seed = createSeedUsers();
  writeJson(USERS_KEY, seed);
  return seed;
}

/**
 * Internal: reads users from storage.
 * - First run, or the list itself is unreadable: seed it.
 * - Some records are corrupt or tampered with: drop only those and keep the rest.
 * - Every record is corrupt: treat the data as broken and restore the seed.
 */
export function readAllUsers(): User[] {
  const stored = readJson(USERS_KEY, storedListSchema);
  if (!stored) return reseed();
  const seenIds = new Set<string>();
  const valid: User[] = [];
  for (const record of stored) {
    const parsed = userSchema.safeParse(record);
    if (parsed.success && !seenIds.has(parsed.data.id)) {
      seenIds.add(parsed.data.id);
      valid.push(parsed.data);
    }
  }
  if (stored.length > 0 && valid.length === 0) return reseed();
  if (valid.length !== stored.length) writeJson(USERS_KEY, valid);
  return valid;
}

function saveUsers(users: User[]) {
  if (!writeJson(USERS_KEY, users)) {
    throw new ApiError("Couldn't save changes: browser storage is full or unavailable.", 507);
  }
}

const ROLE_ORDER = { admin: 0, editor: 1, viewer: 2 } as const;
const STATUS_ORDER = { active: 0, pending: 1, inactive: 2 } as const;

function compareUsers(a: User, b: User, sort: UserQuery["sort"]): number {
  switch (sort) {
    case "name":
      return a.name.localeCompare(b.name);
    case "role":
      return ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.name.localeCompare(b.name);
    case "status":
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.name.localeCompare(b.name);
    case "joinedAt":
      return a.joinedAt.localeCompare(b.joinedAt);
  }
}

export async function listUsers(rawQuery: Partial<UserQuery>): Promise<Paginated<User>> {
  await simulateLatency();
  // Re-validate even though the UI already parsed it: never trust the caller.
  const query = userQuerySchema.parse(rawQuery);
  const needle = query.search.toLowerCase();

  const filtered = readAllUsers().filter((user) => {
    if (query.role !== "all" && user.role !== query.role) return false;
    if (query.status !== "all" && user.status !== query.status) return false;
    if (!needle) return true;
    return (
      user.name.toLowerCase().includes(needle) ||
      user.email.includes(needle) ||
      user.location.toLowerCase().includes(needle)
    );
  });

  const direction = query.dir === "asc" ? 1 : -1;
  filtered.sort((a, b) => compareUsers(a, b, query.sort) * direction);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.pageSize;

  return {
    data: filtered.slice(start, start + query.pageSize),
    total,
    page,
    pageSize: query.pageSize,
    totalPages,
  };
}

function parseInput(input: unknown) {
  const parsed = userInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ApiError("Please fix the highlighted fields.", 422, toFieldErrors(parsed.error));
  }
  return parsed.data;
}

function assertEmailAvailable(users: User[], email: string, exceptId?: string) {
  if (users.some((u) => u.email === email && u.id !== exceptId)) {
    throw new ApiError("Please fix the highlighted fields.", 409, {
      email: "A user with this email already exists",
    });
  }
}

export async function createUser(input: unknown): Promise<User> {
  await simulateLatency();
  const data = parseInput(input);
  const users = readAllUsers();

  if (users.length >= MAX_USERS) {
    throw new ApiError(`The demo is limited to ${MAX_USERS} users. Delete some first.`, 422);
  }
  assertEmailAvailable(users, data.email);

  const now = new Date().toISOString();
  const user: User = { ...data, id: generateId(), joinedAt: now, lastActiveAt: now };
  saveUsers([user, ...users]);
  return user;
}

export async function updateUser(id: string, input: unknown): Promise<User> {
  await simulateLatency();
  const data = parseInput(input);
  const users = readAllUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new ApiError("This user no longer exists.", 404);

  assertEmailAvailable(users, data.email, id);

  const updated: User = { ...users[index], ...data };
  const next = [...users];
  next[index] = updated;
  saveUsers(next);
  return updated;
}

export async function deleteUser(id: string): Promise<void> {
  await simulateLatency();
  const users = readAllUsers();
  const next = users.filter((u) => u.id !== id);
  if (next.length === users.length) throw new ApiError("This user no longer exists.", 404);
  saveUsers(next);
}
