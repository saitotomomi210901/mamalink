import { Header } from "@/app/components/layout/Header";
import { TabBar } from "@/app/components/layout/TabBar";
import { getPosts } from "@/app/actions/posts";
import { BadgeCheck, Users, MessageCircle, Info } from "lucide-react";
import { cn } from "@/app/lib/utils";
import Link from "next/link";

export default async function HomePage() {
  const { data: posts, error } = await getPosts();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />
      
      <main className="px-4 py-6 space-y-8">
        {/* モード切り替えセクション */}
        <section className="grid grid-cols-3 gap-3">
          <button className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 transition-transform active:scale-95">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <Users size={24} />
            </div>
            <span className="text-xs font-bold text-gray-700">あそぼ</span>
          </button>
          <button className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 transition-transform active:scale-95">
            <div className="bg-secondary/10 p-3 rounded-full text-secondary">
              <Info size={24} />
            </div>
            <span className="text-xs font-bold text-gray-700">おしえて</span>
          </button>
          <button className="bg-white p-4 rounded-2xl shadow-sm border border-secondary/20 flex flex-col items-center gap-2 transition-transform active:scale-95 ring-2 ring-secondary/5">
            <div className="bg-secondary p-3 rounded-full text-white shadow-sm">
              <MessageCircle size={24} />
            </div>
            <span className="text-xs font-bold text-secondary">たすけて</span>
          </button>
        </section>

        {/* タイムラインセクション */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">近所の募集</h2>
            <button className="text-xs text-primary font-medium">すべて見る</button>
          </div>

          <div className="space-y-4">
            {error || !posts || posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400">現在、近所の募集はありません。</p>
              </div>
            ) : (
              posts.map((post: any) => (
                <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                        {post.author?.avatar_url ? (
                          <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 text-xs italic">IMG</div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-sm text-gray-800">{post.author?.display_name || '名称未設定'}</span>
                          {post.author?.is_kyc_verified && <BadgeCheck size={14} className="text-blue-500" />}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          信頼スコア: <span className="text-primary font-bold">{post.author?.trust_score || 100}</span>
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold",
                      post.mode === 'tasukete' ? "bg-secondary text-white" : "bg-primary text-white"
                    )}>
                      {post.mode === 'tasukete' ? 'たすけて' : post.mode === 'asobo' ? 'あそぼ' : 'おしえて'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-sm text-gray-800 leading-snug">{post.title}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{post.content}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400">場所: {post.location_name || '未指定'}</span>
                      <span className="text-[10px] text-gray-400">
                        日時: {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '未指定'}
                      </span>
                    </div>
                    <Link 
                      href={`/post/${post.id}`}
                      className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:opacity-90 active:scale-95 transition-all"
                    >
                      詳細を見る
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <TabBar />
    </div>
  );
}
