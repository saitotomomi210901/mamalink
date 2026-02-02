import { auth } from "@clerk/nextjs/server";
import { TabBar } from "@/app/components/layout/TabBar";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { ChevronRight, MessageSquare, Bell, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const supabase = createServiceRoleClient();

  // 最新のメッセージを取得して、会話リストを作成
  const { data: messages, error: messagesError } = await supabase
    .from('chats')
    .select(`
      *,
      match:matches!inner(
        id,
        post_id,
        user_id,
        user:profiles!user_id(display_name, avatar_url),
        post:posts(
          author_id,
          author:profiles!author_id(display_name, avatar_url)
        )
      ),
      sender:profiles!sender_id(display_name, avatar_url)
    `)
    .order('created_at', { ascending: false });

  // 会話相手ごとにユニークなリストを作成
  const conversationsMap = new Map();
  messages?.forEach((msg: any) => {
    // 自分に関係のあるメッセージかチェック
    const isPostAuthor = msg.match.post.author_id === userId;
    const isApplicant = msg.match.user_id === userId;
    
    if (!isPostAuthor && !isApplicant) return;

    const partner = isPostAuthor ? msg.match.user : msg.match.post.author;
    const partnerId = isPostAuthor ? msg.match.user_id : msg.match.post.author_id;
    
    if (!conversationsMap.has(msg.match_id)) {
      conversationsMap.set(msg.match_id, {
        partnerId,
        partner,
        lastMessage: msg.content,
        timestamp: msg.created_at,
        postId: msg.match.post_id
      });
    }
  });

  const conversations = Array.from(conversationsMap.values());

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white px-5 py-6 border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">メッセージ</h1>
      </header>

      <main className="px-4 py-6">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="bg-white p-6 rounded-full shadow-sm text-gray-200">
              <MessageSquare size={48} />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-gray-400">まだメッセージはありません</p>
              <p className="text-xs text-gray-300 leading-relaxed px-10">
                マップや投稿から気になる人に<br />メッセージを送ってみましょう！
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((chat) => (
              <Link 
                key={chat.partnerId}
                href={`/chat/${chat.postId}?receiverId=${chat.partnerId}`}
                className="bg-white p-4 rounded-[24px] border border-gray-50 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all hover:bg-gray-50"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-50 flex-shrink-0">
                  {chat.partner?.avatar_url ? (
                    <img src={chat.partner.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold italic text-sm">?</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black text-gray-800 text-sm truncate">{chat.partner?.display_name || '名称未設定'}</p>
                    <span className="text-[10px] text-gray-300 font-bold">
                      {new Date(chat.timestamp).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium truncate mt-0.5">{chat.lastMessage}</p>
                </div>
                <ChevronRight size={16} className="text-gray-200" />
              </Link>
            ))}
          </div>
        )}
      </main>

      <TabBar />
    </div>
  );
}
