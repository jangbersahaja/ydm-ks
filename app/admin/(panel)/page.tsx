import { Counter } from "@/components/counter";

export const instant = false;

export default async function AdminCounterPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  return <Counter basePath="/admin" page={page} />;
}
