import { TabBar } from "@/app/components/layout/TabBar";
import { getSupabaseProfile } from "@/lib/supabase/auth-helpers";
import { SignOutButton } from "@clerk/nextjs";
import { BadgeCheck, Settings, Shield, Award, MessageCircle, Heart, ChevronRight, Edit2, Baby, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfilePage() {
  const profile = await getSupabaseProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white px-4 pt-6 pb-12 rounded-b-[40px] shadow-sm space-y-6 relative">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-xl text-gray-800">マイページ</h1>
          <div className="flex items-center gap-2">
            <Link href="/profile/edit" className="text-gray-400 p-2 hover:bg-gray-50 rounded-full transition-all">
              <Edit2 size={20} />
            </Link>
            <button className="text-gray-400 p-2">
              <Settings size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-primary/20 overflow-hidden shadow-inner">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 text-xs italic">ME</div>
              )}
            </div>
            {profile.is_kyc_verified && (
              <div className="absolute -bottom-0.5 -right-0.5 bg-white p-0.5 rounded-full shadow-md">
                <BadgeCheck size={16} className="text-blue-500" />
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
        {/* 自己紹介・詳細カード */}
        <div className="bg-white rounded-[32px] p-6 shadow-md border border-gray-100 space-y-6">
          {profile.bio ? (
            <p className="text-sm text-gray-600 leading-relaxed">
              {profile.bio}
            </p>
          ) : (
            <Link href="/profile/edit" className="block text-center py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-xs font-bold hover:bg-gray-50 transition-all">
              自己紹介を設定してマッチ率をアップ！
            </Link>
          )}

          <div className="grid grid-cols-2 gap-4">
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
                  {profile.interests?.length || 0}件登録中
                </p>
              </div>
            </div>
          </div>

          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {profile.interests.map((interest: string) => (
                <span key={interest} className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-full border border-gray-100">
                  #{interest}
                </span>
              ))}
            </div>
          )}
        </div>

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
          <Link href="/profile/my-posts" className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50">
            <div className="flex items-center gap-3">
              <MessageCircle className="text-blue-500" size={20} />
              <span className="text-sm font-medium text-gray-700">自分の投稿を管理</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </Link>
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
