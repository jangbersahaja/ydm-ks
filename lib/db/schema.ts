import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const outlets = pgTable("outlets", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  hours: text("hours").notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  birthday: date("birthday", { mode: "string" }),
  memberCode: text("member_code")
    .notNull()
    .unique()
    .default(sql`upper(substr(md5(random()::text), 1, 12))`),
  cupsProgress: integer("cups_progress").notNull().default(0),
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
  termsVersion: text("terms_version"),
  createdAt: createdAt(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  outletId: integer("outlet_id")
    .notNull()
    .references(() => outlets.id),
  // Bill before the voucher discount. Points are earned on the amount paid.
  amountCents: integer("amount_cents").notNull(),
  discountCents: integer("discount_cents").notNull().default(0),
  redemptionId: integer("redemption_id").references(() => redemptions.id),
  points: integer("points").notNull(),
  cups: integer("cups").notNull().default(0),
  // Client-generated per submission, so a repeated submit is not recorded twice. Null for older rows.
  requestId: text("request_id").unique(),
  createdAt: createdAt(),
});

// Balance = sum(delta). Reasons: "purchase", "redeem", "adjust",
// "bonus:first_purchase", "task:<kind>:<outletCode>".
export const pointLedger = pgTable("point_ledger", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  createdAt: createdAt(),
});

export const taskDefinitions = pgTable(
  "task_definitions",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(),
    outletId: integer("outlet_id")
      .notNull()
      .references(() => outlets.id),
    points: integer("points").notNull(),
    url: text("url").notNull(),
    active: boolean("active").notNull().default(true),
  },
  (t) => [
    uniqueIndex("task_definitions_kind_outlet_idx").on(t.kind, t.outletId),
  ],
);

// A row exists only once the customer has earned the task (one time per account).
export const taskClaims = pgTable(
  "task_claims",
  {
    id: serial("id").primaryKey(),
    customerId: integer("customer_id")
      .notNull()
      .references(() => customers.id),
    taskId: integer("task_id")
      .notNull()
      .references(() => taskDefinitions.id),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("task_claims_customer_task_idx").on(t.customerId, t.taskId),
  ],
);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// Admin-configurable voucher catalog. `value` is a percent for percent_off and cents for amount_off.
export const voucherTypes = pgTable("voucher_types", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  kind: text("kind").notNull(), // percent_off | amount_off | free_drink
  value: integer("value").notNull().default(0),
  pointsCost: integer("points_cost"),
  trigger: text("trigger").notNull(), // points_redeem | registration | birthday | cups
  triggerCount: integer("trigger_count"),
  validDays: integer("valid_days"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const redemptions = pgTable("redemptions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  voucherTypeId: integer("voucher_type_id").references(() => voucherTypes.id),
  code: text("code").notNull().unique(),
  rewardName: text("reward_name").notNull(),
  kind: text("kind").notNull().default("free_drink"),
  value: integer("value").notNull().default(0),
  costPoints: integer("cost_points").notNull().default(0),
  // Prevents auto-issuing the same voucher twice (registration, birthday year).
  awardKey: text("award_key").unique(),
  status: text("status").notNull().default("issued"), // issued | redeemed
  createdAt: createdAt(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
  // Null for vouchers redeemed before outlets were recorded.
  redeemedOutletId: integer("redeemed_outlet_id").references(() => outlets.id),
});
