"use client";

import { useTransition } from "react";
import { acceptMatch } from "@/app/actions/matches";
import { CheckCircle2 } from "lucide-react";

interface AcceptButtonProps {
  postId: string;
  matchId: string;
  status: string;
}

export default function AcceptButton({ postId, matchId, status }: AcceptButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleAccept = async () => {
    if (!confirm("この方に「お願い」を確定しますか？\n確定すると他の応募は締め切られます。")) return;

    startTransition(async () => {
      const result = await acceptMatch(postId, matchId);
      if (!result.success) {
        // エラー内容に応じてユーザーにわかりやすいメッセージを表示
        alert(result.error || "マッチングの確定に失敗しました。時間をおいて再度お試しください。");
      }
    });
  };

  if (status === 'accepted') {
    return (
      <div className="flex-1 py-3.5 bg-green-500 text-white rounded-[20px] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-200">
        <CheckCircle2 size={16} />
        マッチング済み
      </div>
    );
  }

  return (
    <button 
      onClick={handleAccept}
      disabled={isPending}
      className="flex-1 py-3.5 bg-primary text-white rounded-[20px] font-black text-xs shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
    >
      {isPending ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        "お願いする"
      )}
    </button>
  );
}
