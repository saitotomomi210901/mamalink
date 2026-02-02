"use client";

import { TabBar } from "@/app/components/layout/TabBar";
import { useState, useTransition, useRef } from "react";
import { ChevronLeft, MapPin, Calendar, Users, AlertCircle, Camera, X, Map as MapIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPost } from "@/app/actions/posts";

export default function NewPostPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"asobo" | "oshiete" | "tasukete">("tasukete");
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: "現在地付近"
        });
      });
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    formData.append("mode", mode);
    if (location) {
      formData.append("latitude", location.lat.toString());
      formData.append("longitude", location.lng.toString());
    }

    startTransition(async () => {
      try {
        const result = await createPost(formData);
        if (result.success) {
          // 成功したらホームに戻る
          router.push("/");
          router.refresh();
        } else {
          setError(result.error || "エラーが発生しました");
        }
      } catch (e: any) {
        setError(`エラーが発生しました: ${e.message || "不明なエラー"}`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      {/* ヘッダー */}
      <header className="px-4 py-4 flex items-center gap-4 border-b border-gray-50 sticky top-0 bg-white z-10">
        <button onClick={() => router.back()} className="text-gray-600 p-1">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg text-gray-800">新しく投稿する</h1>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* エラー表示 */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-8">
          {/* 画像アップロード */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">写真を追加</label>
            <div className="flex gap-4 items-center">
              {imagePreview ? (
                <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-md">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full backdrop-blur-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-50 transition-all"
                >
                  <Camera size={24} />
                  <span className="text-[10px] font-bold">写真を撮る</span>
                </button>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                name="image"
                accept="image/*" 
                onChange={handleImageChange}
                className="hidden" 
              />
              {!imagePreview && (
                <p className="text-[10px] text-gray-400 max-w-[150px] leading-relaxed">
                  場所の様子や、お礼の品などの写真があると反応が良くなります
                </p>
              )}
            </div>
          </div>

          {/* カテゴリー選択 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">カテゴリー</label>
            <div className="flex gap-2">
              {(["asobo", "oshiete", "tasukete"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${
                    mode === m 
                      ? "bg-primary text-white shadow-lg shadow-primary/20 ring-2 ring-primary/10" 
                      : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {m === "asobo" ? "あそぼ" : m === "oshiete" ? "おしえて" : "たすけて"}
                </button>
              ))}
            </div>
          </div>

          {/* フォーム入力 */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">タイトル</label>
              <input 
                name="title"
                type="text" 
                required
                placeholder="例: 30分だけ見守りをお願いしたいです" 
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">場所</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  name="location_name"
                  type="text" 
                  defaultValue={location?.name || ""}
                  placeholder="場所を入力（例: 〇〇公園、〇〇カフェ）" 
                  className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-gray-300"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <MapIcon size={14} />
                  現在地を取得
                </button>
                <button
                  type="button"
                  className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all"
                  onClick={() => alert("地図から選択機能は、位置情報ライブラリのセットアップ後に有効になります。現在は現在地取得をご利用ください。")}
                >
                  <MapPin size={14} />
                  地図から選ぶ
                </button>
              </div>
              {location && (
                <p className="text-[10px] text-primary font-bold px-2">
                  座標設定済み: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              )}
              <p className="text-[9px] text-primary font-bold pl-1 mt-1">※自宅以外の公共施設やカフェを推奨しています</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">日時</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    name="scheduled_at"
                    type="datetime-local" 
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">募集人数</label>
                <div className="relative">
                  <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    name="max_participants"
                    type="number" 
                    min="1"
                    defaultValue="1"
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">詳細・お礼</label>
              <textarea 
                name="content"
                rows={5}
                required
                placeholder="困っていることや、お礼の内容（例: スタバチケット、お菓子など）を入力してください" 
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none placeholder:text-gray-300 leading-relaxed"
              ></textarea>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isPending}
              className="w-full py-5 bg-secondary text-white font-black text-sm rounded-[24px] shadow-xl shadow-secondary/20 hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isPending ? "送信中..." : "この内容で投稿する"}
            </button>
          </div>
        </form>
      </main>

      <TabBar />
    </div>
  );
}
