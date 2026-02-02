import { auth } from "@clerk/nextjs/server";
import { TabBar } from "@/app/components/layout/TabBar";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { ChevronLeft, Heart, Calendar, MapPin, Info } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cn } from "@/app/lib/utils";

export default async function LikedPostsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const supabase = createServiceRoleClient();

  // 「興味あり（like）」した投稿を取得
  const { data: likedActions } = await supabase
    .from('post_actions')
    .select(`
      post_id,
      post:posts(
        id,
        title,
        content,
        mode,
        location_name,
        image_url,
        scheduled_at,
        author:profiles(display_name, avatar_url)
      )
    `)
    .eq('user_id', userId)
    .eq('action_type', 'like')
    .order('created_at', { ascending: false });

  const posts = likedActions?.map(action => action.post).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-10 flex items-center gap-4">
        <Link href="/profile" className="text-gray-600 p-1">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg text-gray-800">お気に入りした投稿</h1>
      </header>

      <main className="px-4 py-6 space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-[32px] p-10 border border-gray-100 text-center space-y-4 shadow-sm">
            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center text-secondary mx-auto">
              <Heart size={32} fill="currentColor" />
            </div>
            <p className="text-sm font-bold text-gray-400 leading-relaxed">
              まだ「興味あり」にした<br />投稿はありません。
            </p>
            <Link href="/" className="inline-block px-8 py-3 bg-primary text-white rounded-full font-black text-xs shadow-lg shadow-primary/20">
              投稿を探しに行く
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post: any) => (
              <Link 
                key={post.id} 
                href={`/post/${post.id}`}
                className="bg-white rounded-[24px] p-4 border border-gray-50 shadow-sm flex gap-4 active:scale-[0.98] transition-all"
              >
                <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-50">
                  {post.image_url ? (
                    <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/30">
                      <Heart size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider",
                      post.mode === 'tasukete' ? "bg-secondary/10 text-secondary" : 
                      post.mode === 'oshiete' ? "bg-blue-50 text-blue-500" : "bg-primary/10 text-primary"
                    )}>
                      {post.mode === 'tasukete' ? 'たすけて' : post.mode === 'oshiete' ? 'おしえて' : 'あそぼ'}
                    </span>
                    <span className="text-[9px] text-gray-300 font-bold">
                      {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString('ja-JP') : '日程未定'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm truncate">{post.title}</h3>
                  <div className="flex items-center gap-3 text-gray-400 text-[10px] font-bold">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span className="truncate max-w-[80px]">{post.location_name || '場所未設定'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-gray-100 overflow-hidden">
                        <img src={post.author?.avatar_url || ''} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate max-w-[60px]">{post.author?.display_name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <TabBar />
    </div>
  );
}
