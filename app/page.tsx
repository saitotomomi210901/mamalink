import { Header } from "@/app/components/layout/Header";
import { TabBar } from "@/app/components/layout/TabBar";
import { CardStack } from "@/app/components/ui/CardStack";
import { getPosts } from "@/app/actions/posts";
import { Sparkles, Users, MessageCircle, LogIn, UserPlus, MousePointer2, MessageSquare } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function HomePage() {
  const { data: posts, error } = await getPosts();
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 flex flex-col px-5 py-8 space-y-12 pb-32">
        {/* ヒーローセクション / ログイン案内 */}
        {!userId ? (
          <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/10 rounded-[40px] p-8 space-y-8 shadow-sm">
            <div className="space-y-3 relative z-10">
              <h2 className="text-3xl font-black text-gray-900 leading-[1.2] tracking-tight">
                ママたちの「助け合い」を<br />
                もっと身近に。
              </h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                MamaLinkは、近所のママ同士で<br />
                ちょっとした助け合いができる場所です。
              </p>
            </div>
            
            <div className="flex flex-col gap-3 relative z-10">
              <Link href="/sign-up" className="bg-primary text-white py-4.5 rounded-[20px] font-black shadow-xl shadow-primary/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] hover:opacity-95 text-base no-underline">
                <UserPlus size={20} strokeWidth={3} />
                はじめての方はこちら
              </Link>
              <Link href="/sign-in" className="bg-white/80 backdrop-blur-sm text-gray-700 py-4.5 rounded-[20px] font-bold border border-white flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] hover:bg-white text-base shadow-sm no-underline">
                <LogIn size={20} strokeWidth={2.5} />
                ログイン
              </Link>
            </div>

            {/* 装飾用背景 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          </section>
        ) : (
          <section className="bg-primary/5 rounded-[40px] p-8 flex items-center justify-between border border-primary/10">
            <div className="space-y-1">
              <p className="text-xs font-black text-primary uppercase tracking-widest">Welcome back</p>
              <h2 className="text-xl font-black text-gray-800">今日も素敵な出会いを</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
              <Sparkles size={24} fill="currentColor" />
            </div>
          </section>
        )}

        {/* このアプリの使い方 */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-primary rounded-full"></div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter italic">How to use</h3>
            </div>
          </div>
          
          <div className="grid gap-5">
            {[
              { 
                icon: <LogIn size={22} strokeWidth={2.5} />, 
                color: "bg-blue-50 text-blue-500",
                title: "まずはログイン",
                desc: "安心安全なコミュニティのため、まずは会員登録をお願いします。"
              },
              { 
                icon: <Sparkles size={22} strokeWidth={2.5} />, 
                color: "bg-purple-50 text-purple-500",
                title: "興味を登録",
                desc: "あなたにぴったりの募集を表示するために、興味タグを設定します。"
              },
              { 
                icon: <MousePointer2 size={22} strokeWidth={2.5} />, 
                color: "bg-green-50 text-green-500",
                title: "直感的にスワイプ！",
                desc: "気になったものは右へ、そうでないものは左へスワイプ。",
                extra: (
                  <div className="flex gap-2 mt-4">
                    <span className="text-[10px] font-black px-3 py-1.5 bg-secondary/10 text-secondary rounded-full border border-secondary/5">Right: Nice!</span>
                    <span className="text-[10px] font-black px-3 py-1.5 bg-gray-100 text-gray-400 rounded-full border border-gray-50">Left: Skip</span>
                  </div>
                )
              },
              { 
                icon: <MessageSquare size={22} strokeWidth={2.5} />, 
                color: "bg-pink-50 text-pink-500",
                title: "メッセージ交換",
                desc: "マッチングしたら、詳細を個別にやり取りできます。"
              }
            ].map((step, i) => (
              <div key={i} className="group bg-white p-6 rounded-[32px] border border-gray-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] flex items-start gap-5 transition-all hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08)]">
                <div className={`p-4 rounded-2xl ${step.color} shrink-0 transition-transform group-hover:scale-110`}>
                  {step.icon}
                </div>
                <div className="space-y-1.5">
                  <p className="font-black text-gray-900 text-base">{step.title}</p>
                  <p className="text-[13px] text-gray-400 font-medium leading-relaxed">{step.desc}</p>
                  {step.extra}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 募集を見るセクション */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-secondary rounded-full"></div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter italic">New Posts</h3>
            </div>
          </div>

          <div className="relative aspect-[4/5] w-full max-w-sm mx-auto">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            }>
              {error || !posts || posts.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-[40px] border border-gray-100 shadow-sm p-12 text-center space-y-6">
                  <div className="bg-primary/5 p-8 rounded-full text-primary/30">
                    <Sparkles size={48} />
                  </div>
                  <p className="text-sm font-bold text-gray-400 leading-relaxed">
                    現在、新しい募集はありません。<br />最初に投稿してみませんか？
                  </p>
                </div>
              ) : (
                <CardStack initialPosts={posts} />
              )}
            </Suspense>
          </div>
        </section>

        {/* フッター装飾 */}
        <div className="pt-12 pb-8">
          <p className="text-center text-[10px] text-gray-300 font-black tracking-[0.4em] uppercase opacity-60">
            Powered by MamaLink Community
          </p>
        </div>
      </main>

      <TabBar />
    </div>
  );
}
