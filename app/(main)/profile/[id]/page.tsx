import { auth } from "@clerk/nextjs/server";
import { TabBar } from "@/app/components/layout/TabBar";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { ChevronLeft, BadgeCheck, Shield, Award, MessageCircle, MapPin, Baby, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: profileId } = await params;
  const { userId: currentUserId } = await auth();
  if (!currentUserId) redirect("/login");

  const supabase = createServiceRoleClient();

  // ユーザーのプロフィールを取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (!profile) notFound();

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white px-4 pt-6 pb-12 rounded-b-[40px] shadow-sm space-y-6 relative">
        <div className="flex items-center gap-4">
          <Link href="/profile/my-posts" className="text-gray-400 p-1">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="font-bold text-xl text-gray-800">プロフィール</h1>
        </div>

        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white overflow-hidden shadow-lg">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 text-xl font-black italic">?</div>
              )}
            </div>
            {profile.is_kyc_verified && (
              <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md">
                <BadgeCheck size={20} className="text-blue-500" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h2 className="font-bold text-lg text-gray-800">{profile.display_name}</h2>
            <p className="text-xs text-gray-400">{profile.area || '居住エリア未設定'}</p>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 rounded-2xl py-4">
          <div className="flex flex-col items-center">
            <span className="font-bold text-primary">{profile.trust_score || 100}</span>
            <span className="text-[10px] text-gray-400">信頼スコア</span>
          </div>
          <div className="flex flex-col items-center text-yellow-400">
            <div className="flex items-center gap-0.5">
              <Star size={12} fill="currentColor" />
              <span className="font-bold text-gray-800">4.8</span>
            </div>
            <span className="text-[10px] text-gray-400">平均評価</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-800">12</span>
            <span className="text-[10px] text-gray-400">マッチング</span>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-6 space-y-6">
        {/* 自己紹介カード */}
        <div className="bg-white rounded-[32px] p-6 shadow-md border border-gray-100 space-y-6">
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Shield size={12} className="text-primary" />
              About Me
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {profile.bio || "自己紹介はまだ登録されていません。"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
            <div className="bg-orange-50/50 p-4 rounded-2xl flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-xl text-orange-500">
                <Baby size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-orange-400 uppercase">お子様</p>
                <p className="text-xs font-black text-gray-700">
                  {profile.children_info?.count || 0}人 / {profile.children_info?.age_summary || '未設定'}
                </p>
              </div>
            </div>
            <div className="bg-purple-50/50 p-4 rounded-2xl flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-xl text-purple-500">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-purple-400 uppercase">興味関心</p>
                <p className="text-xs font-black text-gray-700">
                  {profile.interests?.length || 0}個のタグ
                </p>
              </div>
            </div>
          </div>

          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest: string) => (
                <span key={interest} className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-full border border-gray-100">
                  #{interest}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* アクション */}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">本人確認済み</p>
              <p className="text-[10px] text-gray-400">このユーザーは公的な身分証で確認済みです</p>
            </div>
          </div>
          <BadgeCheck size={20} className="text-blue-500" />
        </div>
      </main>

      <TabBar />
    </div>
  );
}
