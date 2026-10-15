import { DEFAULT_SETTINGS } from "@/lib/constants";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";
import { eq } from "drizzle-orm";

export type ProgramSettings = {
  pointsPerRinggit: number;
  firstPurchaseBonusPoints: number;
};

export async function getSettings(): Promise<ProgramSettings> {
  const rows = await db.select().from(settings);
  const map: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) map[row.key] = row.value;
  return {
    pointsPerRinggit: Number(map.points_per_ringgit),
    firstPurchaseBonusPoints: Number(map.first_purchase_bonus_points),
  };
}

export async function saveSettings(values: Partial<ProgramSettings>) {
  const entries: [string, string][] = [];
  if (values.pointsPerRinggit !== undefined)
    entries.push(["points_per_ringgit", String(values.pointsPerRinggit)]);
  if (values.firstPurchaseBonusPoints !== undefined)
    entries.push([
      "first_purchase_bonus_points",
      String(values.firstPurchaseBonusPoints),
    ]);

  await Promise.all(
    entries.map(([key, value]) =>
      db
        .insert(settings)
        .values({ key, value })
        .onConflictDoUpdate({ target: settings.key, set: { value } }),
    ),
  );
}

// Staff passwords live in the settings table, one hashed entry per outlet code.
function staffPasswordKey(outletCode: string) {
  return `staff_password_${outletCode}`;
}

async function getStaffPasswordHash(outletCode: string) {
  const [row] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, staffPasswordKey(outletCode)))
    .limit(1);
  return row?.value ?? null;
}

export async function hasStaffPassword(outletCode: string) {
  return (await getStaffPasswordHash(outletCode)) !== null;
}

export async function verifyStaffPassword(
  outletCode: string,
  password: string,
) {
  const stored = await getStaffPasswordHash(outletCode);
  return stored ? verifyPassword(password, stored) : false;
}

export async function saveStaffPassword(outletCode: string, password: string) {
  const value = hashPassword(password);
  await db
    .insert(settings)
    .values({ key: staffPasswordKey(outletCode), value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}
