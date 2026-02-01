"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Send, Info } from "lucide-react";
import { submitReview } from "@/app/actions/reviews";
import { cn } from "@/app/lib/utils";

interface ReviewFormProps {
  postId: string;
  revieweeId: string;
  revieweeName: string;
}

export default function ReviewForm({ postId, revieweeId, revieweeName }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await submitReview(postId, revieweeId, rating, comment);
      if (result.success) {
        router.push("/profile/my-posts");
        router.refresh();
      } else {
        setError(result.error || "エラーが発生しました");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-2">
          <Info size={16} />
          {error}
        </div>
      )}

      {/* 星評価 */}
      <div className="space-y-6 text-center">
        <p className="text-sm font-bold text-gray-500">今回の助け合いはいかがでしたか？</p>
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="transition-all active:scale-90"
            >
              <Star 
                size={48} 
                className={cn(
                  "transition-colors",
                  star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                )} 
              />
            </button>
          ))}
        </div>
        <p className="text-xl font-black text-gray-800">
          {rating === 5 ? "最高でした！" : 
           rating === 4 ? "良かったです" : 
           rating === 3 ? "普通でした" : 
           rating === 2 ? "少し残念でした" : "改善を期待します"}
        </p>
      </div>

      {/* コメント */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">感謝のメッセージを伝えましょう</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          placeholder={`${revieweeName}さんへ、お礼の言葉を入力してください`}
          className="w-full px-6 py-5 bg-gray-50 border-none rounded-[32px] text-sm focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none placeholder:text-gray-300 leading-relaxed"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-5 bg-primary text-white font-black text-base rounded-[24px] shadow-xl shadow-primary/20 hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isPending ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send size={20} strokeWidth={3} />
              完了して評価を送る
            </>
          )}
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-4 px-6 leading-relaxed">
          評価を送ると投稿が正式に「完了」し、<br />
          お相手の信頼スコアに反映されます。
        </p>
      </div>
    </form>
  );
}
