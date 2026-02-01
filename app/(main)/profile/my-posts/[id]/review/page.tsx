import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import ReviewForm from "./ReviewForm";
import { TabBar } from "@/app/components/layout/TabBar";

export default async function PostReviewPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ revieweeId: string }>
}) {
  const { id: postId } = await params;
  const { revieweeId } = await searchParams;
  const { userId } = await auth();
  if (!userId) redirect("/login");

  if (!revieweeId) notFound();

  const supabase = createServiceRoleClient();

  // 投稿の詳細と相手のプロフィールを取得
  const { data: post } = await supabase
    .from('posts')
    .select('title, author_id')
    .eq('id', postId)
    .single();

  if (!post || post.author_id !== userId) notFound();

  const { data: reviewee } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', revieweeId)
    .single();

  if (!reviewee) notFound();

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      <header className="px-4 py-4 flex items-center gap-4 border-b border-gray-50 sticky top-0 bg-white z-10">
        <Link href={`/profile/my-posts/${postId}`} className="text-gray-600 p-1">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg text-gray-800">助け合いの完了</h1>
      </header>

      <main className="px-6 py-10 space-y-10">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-primary/10 overflow-hidden mx-auto shadow-sm">
            {reviewee.avatar_url ? (
              <img src={reviewee.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl font-bold italic">?</div>
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-gray-800">{reviewee.display_name}さん</h2>
            <p className="text-xs text-gray-400 font-medium">「{post.title}」</p>
          </div>
        </div>

        <ReviewForm 
          postId={postId} 
          revieweeId={revieweeId} 
          revieweeName={reviewee.display_name} 
        />
      </main>

      <TabBar />
    </div>
  );
}
