import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  redirect(`/p/${programId}/subjects`);
}
