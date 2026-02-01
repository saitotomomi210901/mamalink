import { auth } from "@clerk/nextjs/server";
import { getMessages } from "@/app/actions/chat";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { redirect, notFound } from "next/navigation";
import ChatRoom from "./ChatRoom";

export default async function ChatPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ receiverId?: string }>
}) {
  const { id: postId } = await params;
  const { receiverId } = await searchParams;
  const { userId: currentUserId } = await auth();

  if (!currentUserId) {
    redirect("/login");
  }

  // 受信者のプロフィール情報を取得
  const supabase = createServiceRoleClient();
  
  // postId が 'new' の場合はマップからの直接チャット（postIdはダミーまたは後で作成）
  // 今回は一旦 postId をキーにしてメッセージをまとめる
  
  let targetReceiverId = receiverId;
  
  // receiverId が不明な場合は、既存のメッセージから特定を試みる
  if (!targetReceiverId) {
    const { data: lastMsg } = await supabase
      .from('messages')
      .select('sender_id, receiver_id')
      .eq('post_id', postId)
      .limit(1)
      .maybeSingle();
    
    if (lastMsg) {
      targetReceiverId = lastMsg.sender_id === currentUserId ? lastMsg.receiver_id : lastMsg.sender_id;
    }
  }

  if (!targetReceiverId) {
    notFound();
  }

  const { data: receiverProfile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', targetReceiverId)
    .single();

  const { data: messages = [] } = await getMessages(postId);

  return (
    <ChatRoom 
      postId={postId}
      receiverId={targetReceiverId}
      initialMessages={messages || []}
      currentUserId={currentUserId}
      receiverProfile={receiverProfile}
    />
  );
}
