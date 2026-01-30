import { TabBar } from "@/app/components/layout/TabBar";
import { getSupabaseProfile } from "@/lib/supabase/auth-helpers";
import { SignOutButton } from "@clerk/nextjs";
import { BadgeCheck, Settings, Shield, Award, MessageCircle, Heart, ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const profile = await getSupabaseProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 pt-6 pb-12 rounded-b-[40px] shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-xl text-gray-800">マイページ</h1>
          <button className="text-gray-400 p-2">
            <Settings size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-primary/20 overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 italic">ME</div>
              )}
            </div>
            {profile.is_kyc_verified && (
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
                <BadgeCheck size={24} className="text-blue-500" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h2 className="font-bold text-lg text-gray-800">{profile.display_name}</h2>
            <p className="text-xs text-gray-400">{profile.area || '地域未設定'}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 rounded-2xl py-4">
          <div className="flex flex-col items-center">
            <span className="font-bold text-primary">{profile.trust_score}</span>
            <span className="text-[10px] text-gray-400">信頼スコア</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-800">0</span>
            <span className="text-[10px] text-gray-400">助けた回数</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-800">0</span>
            <span className="text-[10px] text-gray-400">助けられた回数</span>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-6 space-y-6">
        {/* ステータスカード */}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">本人確認ステータス</p>
              <p className="text-[10px] text-gray-400">
                {profile.is_kyc_verified ? "すべての機能を利用可能です" : "本人確認を完了して信頼を高めましょう"}
              </p>
            </div>
          </div>
          {profile.is_kyc_verified ? (
            <BadgeCheck size={20} className="text-blue-500" />
          ) : (
            <ChevronRight size={20} className="text-gray-300" />
          )}
        </div>

        {/* メニューリスト */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50">
            <div className="flex items-center gap-3">
              <Award className="text-yellow-500" size={20} />
              <span className="text-sm font-medium text-gray-700">獲得バッジ</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50">
            <div className="flex items-center gap-3">
              <MessageCircle className="text-primary" size={20} />
              <span className="text-sm font-medium text-gray-700">おしえて掲示板の履歴</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Heart className="text-secondary" size={20} />
              <span className="text-sm font-medium text-gray-700">お気に入り</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        </section>

        <SignOutButton>
          <button className="w-full py-4 text-red-500 text-sm font-bold bg-white rounded-2xl shadow-sm border border-red-50">
            ログアウト
          </button>
        </SignOutButton>
      </main>

      <TabBar />
    </div>
  );
}
