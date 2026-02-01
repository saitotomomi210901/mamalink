import { getSupabaseProfile } from "@/lib/supabase/auth-helpers";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import EditForm from "./EditForm";
import { TabBar } from "@/app/components/layout/TabBar";

export default async function ProfileEditPage() {
  const profile = await getSupabaseProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      {/* ヘッダー */}
      <header className="px-4 py-4 flex items-center justify-between border-b border-gray-50 sticky top-0 bg-white z-10">
        <Link href="/profile" className="text-gray-600 p-1">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg text-gray-800">プロフィール編集</h1>
        <div className="w-8"></div>
      </header>

      <main className="px-5 py-8">
        <EditForm initialData={profile} />
      </main>

      <TabBar />
    </div>
  );
}
