export const TASK_KINDS = [
  "google_profile",
  "follow_instagram",
  "follow_tiktok",
] as const;

export type TaskKind = (typeof TASK_KINDS)[number];

export function isTaskKind(value: string): value is TaskKind {
  return (TASK_KINDS as readonly string[]).includes(value);
}

// Staff counter URL slug -> outlet code (see scripts/seed.ts).
export const STAFF_OUTLETS: Record<string, string> = {
  ksnus: "nu-sentral",
  kscic: "central-i-city",
};

export const DEFAULT_SETTINGS = {
  points_per_ringgit: "1",
  first_purchase_bonus_points: "2",
} as const;

export const VOUCHER_KINDS = [
  "percent_off",
  "amount_off",
  "free_drink",
] as const;
export type VoucherKind = (typeof VOUCHER_KINDS)[number];

export const VOUCHER_TRIGGERS = [
  "points_redeem",
  "registration",
  "birthday",
  "cups",
] as const;
export type VoucherTrigger = (typeof VOUCHER_TRIGGERS)[number];

export const DEFAULT_VOUCHER_TYPES: {
  code: string;
  name: string;
  kind: VoucherKind;
  value: number;
  pointsCost: number | null;
  trigger: VoucherTrigger;
  triggerCount: number | null;
  validDays: number | null;
  sortOrder: number;
}[] = [
  {
    code: "signup_50",
    name: "New member 50% off",
    kind: "percent_off",
    value: 50,
    pointsCost: null,
    trigger: "registration",
    triggerCount: null,
    validDays: 30,
    sortOrder: 10,
  },
  {
    code: "cups_free_drink",
    name: "Free drink",
    kind: "free_drink",
    value: 0,
    pointsCost: null,
    trigger: "cups",
    triggerCount: 10,
    validDays: null,
    sortOrder: 20,
  },
  {
    code: "birthday_drink",
    name: "Birthday free drink",
    kind: "free_drink",
    value: 0,
    pointsCost: null,
    trigger: "birthday",
    triggerCount: null,
    validDays: 30,
    sortOrder: 30,
  },
  {
    code: "redeem_rm3",
    name: "RM3 voucher",
    kind: "amount_off",
    value: 300,
    pointsCost: 30,
    trigger: "points_redeem",
    triggerCount: null,
    validDays: null,
    sortOrder: 40,
  },
  {
    code: "redeem_rm6",
    name: "RM6 voucher",
    kind: "amount_off",
    value: 600,
    pointsCost: 55,
    trigger: "points_redeem",
    triggerCount: null,
    validDays: null,
    sortOrder: 50,
  },
  {
    code: "redeem_rm10",
    name: "RM10 voucher",
    kind: "amount_off",
    value: 1000,
    pointsCost: 90,
    trigger: "points_redeem",
    triggerCount: null,
    validDays: null,
    sortOrder: 60,
  },
];

export const TASK_POINTS: Record<TaskKind, number> = {
  google_profile: 2,
  follow_instagram: 1,
  follow_tiktok: 1,
};

// Keyed by outlet code (see scripts/seed.ts).
export const OUTLET_TASK_URLS: Record<string, Record<TaskKind, string>> = {
  "central-i-city": {
    google_profile:
      "https://www.google.com/maps/place/?q=place_id:ChIJnd3QEABTzDERUOHbUjzLSRc",
    follow_instagram: "https://www.instagram.com/kopisaigon.icity/",
    follow_tiktok: "https://www.tiktok.com/@kopisaigon.icity",
  },
  "nu-sentral": {
    google_profile:
      "https://www.google.com/maps/place/?q=place_id:ChIJnYfObE5JzDERf_Enu2y1dzs",
    follow_instagram: "https://www.instagram.com/kopisaigon.nusentral/",
    follow_tiktok: "https://www.tiktok.com/@kopisaigon.nusentral",
  },
};
