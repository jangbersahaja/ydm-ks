import {
  DEFAULT_SETTINGS,
  DEFAULT_VOUCHER_TYPES,
  OUTLET_TASK_URLS,
  TASK_KINDS,
  TASK_POINTS,
} from "@/lib/constants";
import { db } from "@/lib/db";
import {
  outlets,
  settings,
  taskDefinitions,
  voucherTypes,
} from "@/lib/db/schema";
import { notInArray } from "drizzle-orm";

async function main() {
  await db
    .insert(outlets)
    .values([
      {
        code: "central-i-city",
        name: "Kopi Saigon Central I-City",
        address: "I-City, Shah Alam, Selangor (demo, confirm)",
        hours: "10:00 - 22:00 (demo)",
      },
      {
        code: "nu-sentral",
        name: "Kopi Saigon NU Sentral",
        address: "NU Sentral, Kuala Lumpur (demo, confirm)",
        hours: "10:00 - 22:00 (demo)",
      },
    ])
    .onConflictDoNothing({ target: outlets.code });

  const outletRows = await db
    .select({ id: outlets.id, code: outlets.code })
    .from(outlets);
  for (const outlet of outletRows) {
    const urls = OUTLET_TASK_URLS[outlet.code];
    if (!urls) continue;
    for (const kind of TASK_KINDS) {
      const points = TASK_POINTS[kind];
      const url = urls[kind];
      await db
        .insert(taskDefinitions)
        .values({ kind, outletId: outlet.id, points, url, active: true })
        .onConflictDoUpdate({
          target: [taskDefinitions.kind, taskDefinitions.outletId],
          set: { points, url, active: true },
        });
    }
  }

  await db
    .update(taskDefinitions)
    .set({ active: false })
    .where(notInArray(taskDefinitions.kind, [...TASK_KINDS]));

  await db
    .insert(settings)
    .values(
      Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({ key, value })),
    )
    .onConflictDoNothing({ target: settings.key });

  // Existing rows are kept so admin edits to vouchers survive re-seeding.
  await db
    .insert(voucherTypes)
    .values(
      DEFAULT_VOUCHER_TYPES.map((v) => ({
        code: v.code,
        name: v.name,
        kind: v.kind,
        value: v.value,
        pointsCost: v.pointsCost,
        trigger: v.trigger,
        triggerCount: v.triggerCount,
        validDays: v.validDays,
        sortOrder: v.sortOrder,
      })),
    )
    .onConflictDoNothing({ target: voucherTypes.code });

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
