import { redirect } from "next/navigation";

/**
 * Test marks are entered per subject: open a subject, then the Test marks tab
 * (or add ?section=test-marks to the subject URL). This path remains as a
 * redirect for old bookmarks and links.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  redirect(`/p/${programId}/subjects`);
}
