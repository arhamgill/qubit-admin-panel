import type { Profile, Settings, User, UserRole, UserStatus } from "@/types";

/** Small deterministic PRNG so the seed data is identical on every reset. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  "Ava", "Liam", "Noah", "Emma", "Olivia", "Ethan", "Sophia", "Mason", "Isabella", "Lucas",
  "Mia", "Aiden", "Amelia", "Zara", "Omar", "Hana", "Yusuf", "Layla", "Daniel", "Chloe",
  "Ibrahim", "Grace", "Ryan", "Fatima", "Leo", "Nora", "Arjun", "Sara", "Mateo", "Aisha",
];

const LAST_NAMES = [
  "Khan", "Smith", "Patel", "Garcia", "Chen", "Johnson", "Ahmed", "Williams", "Kim", "Brown",
  "Rossi", "Silva", "Nguyen", "Müller", "Hassan", "Taylor", "Lopez", "Ali", "Martin", "Clarke",
  "Haddad", "Novak", "Okafor", "Tanaka", "Malik", "Evans", "Costa", "Rahman", "Fischer", "O'Brien",
];

const LOCATIONS = [
  "Karachi, PK", "Lahore, PK", "Islamabad, PK", "Dubai, AE", "London, UK", "Berlin, DE",
  "New York, US", "Austin, US", "Toronto, CA", "Singapore, SG", "Sydney, AU", "Lisbon, PT",
  "Tokyo, JP", "Nairobi, KE", "Madrid, ES",
];

const DAY = 86_400_000;

function pick<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)];
}

function weighted<T extends string>(rand: () => number, weights: Record<T, number>): T {
  const roll = rand();
  let acc = 0;
  const entries = Object.entries(weights) as [T, number][];
  for (const [value, weight] of entries) {
    acc += weight;
    if (roll < acc) return value;
  }
  return entries[entries.length - 1][0];
}

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

export function createSeedUsers(count = 48, now = Date.now()): User[] {
  const rand = mulberry32(20_240_917);
  const usedEmails = new Set<string>();
  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    const first = pick(rand, FIRST_NAMES);
    const last = pick(rand, LAST_NAMES);
    let email = `${slug(first)}.${slug(last)}@example.com`;
    let n = 2;
    while (usedEmails.has(email)) {
      email = `${slug(first)}.${slug(last)}${n++}@example.com`;
    }
    usedEmails.add(email);

    const role = weighted<UserRole>(rand, { admin: 0.1, editor: 0.3, viewer: 0.6 });
    const status = weighted<UserStatus>(rand, { active: 0.65, pending: 0.15, inactive: 0.2 });

    // Skew join dates towards the recent past so growth metrics look realistic.
    const joinedDaysAgo = Math.floor(Math.pow(rand(), 1.5) * 420);
    const joinedAt = now - joinedDaysAgo * DAY - Math.floor(rand() * DAY);

    let lastActiveAt: number;
    if (status === "pending") {
      lastActiveAt = joinedAt;
    } else if (status === "active") {
      lastActiveAt = Math.max(joinedAt, now - Math.floor(rand() * 6 * DAY));
    } else {
      lastActiveAt = Math.max(joinedAt, now - (30 + Math.floor(rand() * 120)) * DAY);
    }

    users.push({
      id: `usr_${(i + 1).toString().padStart(4, "0")}`,
      name: `${first} ${last}`,
      email,
      role,
      status,
      location: pick(rand, LOCATIONS),
      joinedAt: new Date(joinedAt).toISOString(),
      lastActiveAt: new Date(lastActiveAt).toISOString(),
    });
  }

  return users.sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
}

export const DEFAULT_PROFILE: Profile = {
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  jobTitle: "Operations Lead",
  phone: "+92 300 1234567",
  location: "Karachi, PK",
  bio: "Keeping the team, the numbers and the customers happy.",
};

export const DEFAULT_SETTINGS: Settings = {
  notifications: {
    productUpdates: true,
    weeklyReport: true,
    securityAlerts: true,
    newUserSignups: false,
  },
  timezone: "Asia/Karachi",
};

// ---------------------------------------------------------------------------
// Revenue: derived deterministically from the calendar date, so no storage is
// needed and the same day always shows the same figure.
// ---------------------------------------------------------------------------

const REVENUE_ANCHOR = Date.UTC(2024, 0, 1);

export function dailyRevenue(date: Date): number {
  const utcDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayIndex = Math.floor((utcDay - REVENUE_ANCHOR) / DAY);
  const noise = mulberry32(dayIndex * 2_654_435_761)();

  const trend = 2600 + Math.max(dayIndex, 0) * 2.4;
  const weekday = date.getDay();
  const weekly = weekday === 0 || weekday === 6 ? 0.78 : weekday === 2 || weekday === 3 ? 1.08 : 1;
  const seasonal = 1 + 0.08 * Math.sin((2 * Math.PI * date.getMonth()) / 12);
  const jitter = 0.85 + noise * 0.3;

  return Math.round(trend * weekly * seasonal * jitter);
}
