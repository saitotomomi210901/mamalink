import { auth } from "@clerk/nextjs/server";
import { TabBar } from "@/app/components/layout/TabBar";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { ChevronLeft, MessageSquare, Clock, CheckCircle2, ChevronRight, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyPostsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const supabase = createServiceRoleClient();

  // 自分が投稿した内容を取得（応募者数もカウント）
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      matches(count)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white px-4 py-4 flex items-center gap-4 border-b border-gray-50 sticky top-0 z-10">
        <Link href="/profile" className="text-gray-600 p-1">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg text-gray-800">自分の投稿を管理</h1>
      </header>

      <main className="px-4 py-6 space-y-4">
        {!posts || posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 space-y-4">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center text-gray-300 mx-auto">
              <MessageSquare size={32} />
            </div>
            <p className="text-sm font-bold text-gray-400">まだ投稿がありません</p>
            <Link href="/post/new" className="inline-block px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs">
              新しく投稿する
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-3xl border border-gray-50 shadow-sm overflow-hidden">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    post.mode === 'tasukete' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                  }`}>
                    {post.mode === 'tasukete' ? 'たすけて' : post.mode === 'asobo' ? 'あそぼ' : 'おしえて'}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                    <Clock size={12} />
                    {new Date(post.created_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>

                <h3 className="font-black text-gray-800 leading-snug">{post.title}</h3>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users size={14} className="text-gray-300" />
                      <span className="text-xs font-bold text-gray-600">{post.matches?.[0]?.count || 0}人の応募</span>
                    </div>
                    {post.status === 'matched' && (
                      <div className="flex items-center gap-1 text-green-500">
                        <CheckCircle2 size={14} />
                        <span className="text-xs font-bold">マッチング済み</span>
                      </div>
                    )}
                    {post.status === 'completed' && (
                      <div className="flex items-center gap-1 text-primary">
                        <Sparkles size={14} />
                        <span className="text-xs font-bold">完了</span>
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    href={`/profile/my-posts/${post.id}`}
                    className="flex items-center gap-1 text-xs font-black text-primary hover:opacity-70 transition-all"
                  >
                    詳細・応募者を見る
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      <TabBar />
    </div>
  );
}
