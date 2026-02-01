import { auth } from "@clerk/nextjs/server";
import { TabBar } from "@/app/components/layout/TabBar";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { ChevronLeft, MessageSquare, BadgeCheck, Star, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import AcceptButton from "./AcceptButton";

export default async function PostApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const supabase = createServiceRoleClient();

  // 投稿の詳細と応募者（profiles）を取得
  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      matches(
        id,
        status,
        user:profiles(id, display_name, avatar_url, trust_score, is_kyc_verified, bio, children_info, interests)
      )
    `)
    .eq('id', postId)
    .eq('author_id', userId)
    .single();

  if (!post) notFound();

  const applicants = post.matches || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-10 flex items-center gap-4">
        <Link href="/profile/my-posts" className="text-gray-600 p-1">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg text-gray-800 truncate">{post.title}</h1>
      </header>

      <main className="px-4 py-6 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
            <h3 className="text-xl font-black text-gray-800 tracking-tight">応募者 ({applicants.length}名)</h3>
          </div>

          {applicants.length === 0 ? (
            <div className="bg-white rounded-[32px] p-10 border border-gray-100 text-center space-y-4 shadow-sm">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center text-gray-200 mx-auto">
                <Sparkles size={32} />
              </div>
              <p className="text-sm font-bold text-gray-400 leading-relaxed">
                まだ応募はありません。<br />
                近所のママに見つかるまで少しお待ちください。
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((match: any) => (
                <div key={match.id} className="bg-white rounded-[32px] border border-gray-50 shadow-sm overflow-hidden p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-primary/10 overflow-hidden shrink-0">
                      {match.user?.avatar_url ? (
                        <img src={match.user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">?</div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-black text-gray-800 text-base">{match.user?.display_name || '名称未設定'}</p>
                        {match.user?.is_kyc_verified && <BadgeCheck size={16} className="text-blue-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-primary/10 text-primary font-black px-2 py-0.5 rounded-full">信頼スコア {match.user?.trust_score || 100}</span>
                        <div className="flex items-center text-yellow-400 gap-0.5">
                          <Star size={10} fill="currentColor" />
                          <span className="text-[10px] font-bold text-gray-400">4.8 (12回)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {match.user?.bio && (
                    <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                      {match.user.bio}
                    </p>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {match.user?.interests?.map((interest: string) => (
                      <span key={interest} className="text-[9px] font-bold text-gray-400 bg-white border border-gray-100 px-2 py-1 rounded-full">
                        #{interest}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Link 
                      href={`/chat/${postId}?receiverId=${match.user?.id}`}
                      className="flex-1 py-3.5 bg-gray-50 text-gray-600 rounded-[20px] font-black text-xs border border-gray-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <MessageSquare size={16} />
                      相談する
                    </Link>
                    
                    {post.status === 'completed' ? (
                      <div className="flex-1 py-3.5 bg-gray-100 text-gray-400 rounded-[20px] font-black text-xs flex items-center justify-center gap-2">
                        <Sparkles size={16} />
                        完了済み
                      </div>
                    ) : match.status === 'accepted' ? (
                      <Link 
                        href={`/profile/my-posts/${postId}/review?revieweeId=${match.user?.id}`}
                        className="flex-1 py-3.5 bg-green-500 text-white rounded-[20px] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-200 active:scale-95 transition-all"
                      >
                        <CheckCircle2 size={16} />
                        完了して評価する
                      </Link>
                    ) : (
                      <AcceptButton 
                        postId={postId}
                        matchId={match.id}
                        status={match.status}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <TabBar />
    </div>
  );
}
