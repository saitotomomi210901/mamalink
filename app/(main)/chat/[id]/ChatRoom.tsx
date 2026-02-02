"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { ChevronLeft, Send, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { sendMessage } from "@/app/actions/chat";
import { cn } from "@/app/lib/utils";
import { useRealtime } from "@/app/components/realtime/RealtimeProvider";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    display_name: string;
    avatar_url: string;
  };
}

interface ChatRoomProps {
  postId: string;
  receiverId: string;
  initialMessages: Message[];
  currentUserId: string;
  receiverProfile: any;
}

export default function ChatRoom({ 
  postId, 
  receiverId, 
  initialMessages, 
  currentUserId,
  receiverProfile
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { supabase } = useRealtime();

  // リアルタイム購読
  useEffect(() => {
    if (!currentUserId || !supabase) return;

    let channel: RealtimeChannel;

    const setupChatRealtime = async () => {
      // チャンネル名: chat:{postId}
      channel = supabase.channel(`chat:${postId}`, {
        config: { private: true }
      });

      channel
        .on("broadcast", { event: "new_message" }, (payload) => {
          const newMessage = payload.payload as Message;
          // 自分が送ったメッセージ（楽観的更新済み）は重複させない
          setMessages((prev) => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        })
        .subscribe();
    };

    setupChatRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [postId, currentUserId, supabase]);

  // 最新メッセージまでスクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isPending) return;

    const content = inputValue.trim();
    setInputValue("");

    // 即座に画面に反映（楽観的更新風）
    const tempId = Math.random().toString();
    const newMessage: Message = {
      id: tempId,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);

    startTransition(async () => {
      const result = await sendMessage(postId, receiverId, content);
      if (!result.success) {
        // エラー時はメッセージを消すか再送を促す
        setMessages(prev => prev.filter(m => m.id !== tempId));
        alert("送信に失敗しました");
      }
    });
  };

  const sendQuickReply = async (text: string) => {
    if (isPending) return;

    // 即座に画面に反映
    const tempId = Math.random().toString();
    const newMessage: Message = {
      id: tempId,
      sender_id: currentUserId,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);

    startTransition(async () => {
      const result = await sendMessage(postId, receiverId, text);
      if (!result.success) {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        alert("送信に失敗しました");
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto">
      {/* ヘッダー */}
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()} className="text-gray-400 p-1">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-50 flex-shrink-0">
            {receiverProfile?.avatar_url ? (
              <img src={receiverProfile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold italic">?</div>
            )}
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-sm">{receiverProfile?.display_name || '名称未設定'}</h1>
            <p className="text-[10px] text-green-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              オンライン
            </p>
          </div>
        </div>
      </header>

      {/* メッセージエリア */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth"
      >
        <div className="text-center py-4">
          <span className="bg-gray-200/50 text-gray-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            Conversation started
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div 
              key={msg.id} 
              className={cn(
                "flex items-end gap-2",
                isMe ? "flex-row-reverse" : "flex-row"
              )}
            >
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-white shadow-sm">
                  {receiverProfile?.avatar_url ? (
                    <img src={receiverProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] font-bold italic">?</div>
                  )}
                </div>
              )}
              <div className={cn(
                "max-w-[75%] px-4 py-3 rounded-[24px] text-sm shadow-sm",
                isMe 
                  ? "bg-primary text-white rounded-br-none" 
                  : "bg-white text-gray-700 border border-gray-100 rounded-bl-none"
              )}>
                <p className="leading-relaxed">{msg.content}</p>
              </div>
              <span className="text-[9px] text-gray-300 font-bold mb-1">
                {new Date(msg.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </main>

      {/* 入力エリア */}
      <div className="p-4 bg-white border-t border-gray-100 pb-10 space-y-4">
        {/* クイックリプライ */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["向かってます！", "到着しました", "ありがとうございます", "了解です！"].map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => sendQuickReply(text)}
              className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black text-gray-500 whitespace-nowrap active:bg-primary active:text-white transition-all shadow-sm"
            >
              {text}
            </button>
          ))}
        </div>

        <form 
          onSubmit={handleSend}
          className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-[28px] border border-gray-100 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all"
        >
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 py-2 outline-none"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isPending}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 disabled:opacity-30 disabled:shadow-none transition-all"
          >
            <Send size={18} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
