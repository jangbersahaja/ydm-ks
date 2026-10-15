import {
  getBalance,
  getCupsVoucherType,
  getCustomer,
  getLatestPurchaseSummary,
} from "@/lib/db/queries";
import { getCustomerId } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const customerId = await getCustomerId();
  if (customerId === null) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cupsRule = await getCupsVoucherType();
  const purchase = await getLatestPurchaseSummary(
    customerId,
    cupsRule?.id ?? null,
  );
  if (!purchase) return NextResponse.json({ purchase: null });

  const [customer, balance] = await Promise.all([
    getCustomer(customerId),
    getBalance(customerId),
  ]);
  const cupsTarget = cupsRule?.triggerCount ?? 0;

  return NextResponse.json({
    purchase: {
      ...purchase,
      balance,
      cupsProgress: Math.min(customer?.cupsProgress ?? 0, cupsTarget),
      cupsTarget,
    },
  });
}
