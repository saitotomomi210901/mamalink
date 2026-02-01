import { TabBar } from "@/app/components/layout/TabBar";
import { getPostById } from "@/app/actions/posts";
import { applyToPost } from "@/app/actions/matches";
import { auth } from "@clerk/nextjs/server";
import { ChevronLeft, MapPin, Calendar, Users, BadgeCheck, MessageCircle, Share2, MoreHorizontal, AlertCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  const { data: post, error } = await getPostById(id);

  if (error || !post) {
    notFound();
  }

  const isAuthor = post.author_id === userId;

  // すでに応募済みか確認 (安全な Service Role を使用)
  const supabaseAdmin = createServiceRoleClient();
  const { data: existingMatch } = userId 
    ? await supabaseAdmin.from('matches').select('id').eq('post_id', id).eq('user_id', userId).maybeSingle()
    : { data: null };

  const hasApplied = !!existingMatch;

  // サーバーアクションを呼び出すための関数
  async function handleApply() {
    'use server'
    await applyToPost(id);
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* ヘッダー */}
      <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-gray-50">
        <Link href="/" className="text-gray-600 p-1">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex items-center gap-2">
          <button className="text-gray-600 p-2"><Share2 size={20} /></button>
          <button className="text-gray-600 p-2"><MoreHorizontal size={20} /></button>
        </div>
      </header>

      <main className="pt-20 px-4 space-y-8">
        {/* 投稿画像（ある場合） */}
        {post.image_url && (
          <section className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-xl ring-1 ring-black/5">
            <img src={post.image_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg backdrop-blur-md ${
                post.mode === 'tasukete' ? "bg-secondary/90 text-white" : "bg-primary/90 text-white"
              }`}>
                {post.mode === 'tasukete' ? 'たすけて' : post.mode === 'asobo' ? 'あそぼ' : 'おしえて'}
              </span>
            </div>
          </section>
        )}

        {/* 投稿者情報 */}
        <section className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
            {post.author?.avatar_url ? (
              <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs italic">IMG</div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-800">{post.author?.display_name || '名称未設定'}</span>
              {post.author?.is_kyc_verified && <BadgeCheck size={16} className="text-blue-500" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">信頼スコア {post.author?.trust_score || 100}</span>
              <span className="text-[10px] text-gray-400">実績: 12回</span>
            </div>
          </div>
        </section>

        {/* 投稿内容 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
             <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
               post.mode === 'tasukete' ? "bg-secondary text-white" : "bg-primary text-white"
             }`}>
              {post.mode === 'tasukete' ? 'たすけて' : post.mode === 'asobo' ? 'あそぼ' : 'おしえて'}
            </span>
            <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString('ja-JP')} 投稿</span>
          </div>
          
          <h1 className="text-xl font-bold text-gray-800 leading-tight">{post.title}</h1>
          
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </section>

        {/* 条件詳細 */}
        <section className="bg-gray-50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-xl shadow-sm text-primary">
              <MapPin size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">集合場所</p>
                  <p className="text-sm font-bold text-gray-700">{post.location_name || '未指定'}</p>
                </div>
                {post.latitude && post.longitude && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] bg-primary/10 text-primary font-black px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all"
                  >
                    地図で確認
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-xl shadow-sm text-primary">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">日時</p>
              <p className="text-sm font-bold text-gray-700">
                {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString('ja-JP', { 
                  month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' 
                }) : '未指定'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-xl shadow-sm text-primary">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">募集人数</p>
              <p className="text-sm font-bold text-gray-700">最大 {post.max_participants} 名</p>
            </div>
          </div>
        </section>

        {/* 注意事項 */}
        <section className="bg-orange-50/50 rounded-2xl p-4 flex gap-3">
          <div className="text-orange-500 mt-0.5"><AlertCircle size={18} /></div>
          <p className="text-[10px] text-orange-700 leading-relaxed">
            MamaLinkでは、自宅以外の公共施設（公園、児童館、カフェ等）での待ち合わせを推奨しています。
            初めての方と会う際は、周囲に人がいる場所を選んでください。
          </p>
        </section>
      </main>

      {/* アクションボタン */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-10 flex gap-3">
        {isAuthor ? (
          <button className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl transition-all active:scale-[0.98]">
            自分の投稿を管理する
          </button>
        ) : (
          <>
            <Link 
              href={`/chat/${post.id}?receiverId=${post.author_id}`}
              className="flex-none p-4 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center"
            >
              <MessageSquare size={24} />
            </Link>
            
            {hasApplied ? (
              <button disabled className="flex-1 py-4 bg-gray-100 text-gray-400 font-bold rounded-2xl">
                応募済みです
              </button>
            ) : (
              <form action={handleApply} className="flex-1">
                <button 
                  type="submit"
                  className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:opacity-95 transition-all active:scale-[0.98]"
                >
                  {post.mode === 'tasukete' ? '助ける（応募する）' : '参加する'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
