const TIME_ZONE = "Asia/Kuala_Lumpur";

// Returns the current date as YYYY-MM-DD in Malaysia time.
export function todayInKL(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

// Accepts YYYY-MM-DD only. Returns the value when it is a real past date, else null.
export function parseBirthday(input: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const [year, month, day] = input.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  if (year < 1900 || input > todayInKL()) return null;
  return input;
}
