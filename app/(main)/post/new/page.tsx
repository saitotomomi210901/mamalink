"use client";

import { TabBar } from "@/app/components/layout/TabBar";
import { useState, useTransition } from "react";
import { ChevronLeft, MapPin, Calendar, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPost } from "@/app/actions/posts";

export default function NewPostPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"asobo" | "oshiete" | "tasukete">("tasukete");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    formData.append("mode", mode);

    startTransition(async () => {
      const result = await createPost(formData);
      if (result.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(result.error || "エラーが発生しました");
      }
    });
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="px-4 py-4 flex items-center gap-4 border-b border-gray-50">
        <button onClick={() => router.back()} className="text-gray-600 p-1">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg text-gray-800">新しく投稿する</h1>
      </header>

      <main className="px-4 py-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          {/* カテゴリー選択 */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">カテゴリー</label>
            <div className="flex gap-2">
              {(["asobo", "oshiete", "tasukete"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                    mode === m 
                      ? "bg-primary text-white shadow-md ring-2 ring-primary/20" 
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {m === "asobo" ? "あそぼ" : m === "oshiete" ? "おしえて" : "たすけて"}
                </button>
              ))}
            </div>
          </div>

          {/* フォーム入力 */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">タイトル</label>
              <input 
                name="title"
                type="text" 
                required
                placeholder="例: 30分だけ見守りをお願いしたいです" 
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">場所</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  name="location_name"
                  type="text" 
                  placeholder="場所を入力（例: 〇〇公園、〇〇カフェ）" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
              <p className="text-[10px] text-primary font-medium pl-1">※自宅以外の公共施設やカフェを推奨しています</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">日時</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    name="scheduled_at"
                    type="datetime-local" 
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">募集人数</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    name="max_participants"
                    type="number" 
                    min="1"
                    placeholder="1"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">詳細・お礼</label>
              <textarea 
                name="content"
                rows={4}
                required
                placeholder="困っていることや、お礼の内容（例: スタバチケット、お菓子など）を入力してください" 
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
              ></textarea>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-secondary text-white font-bold rounded-2xl shadow-lg shadow-secondary/20 hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isPending ? "投稿中..." : "投稿する"}
          </button>
        </form>
      </main>

      <TabBar />
    </div>
  );
}
