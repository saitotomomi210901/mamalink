import { ensureSupabaseUser } from "@/lib/supabase/auth-helpers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // 認証チェック
  if (!userId) {
    redirect("/login");
  }

  // Clerk ユーザー情報を Supabase に同期
  await ensureSupabaseUser();

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
