import { DEFAULT_SETTINGS } from "@/lib/constants";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";

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
