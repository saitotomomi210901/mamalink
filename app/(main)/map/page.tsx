"use client";

import { useEffect, useState } from "react";
import { TabBar } from "@/app/components/layout/TabBar";
import { MapPin, Navigation, User, Info, Settings, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { getPosts } from "@/app/actions/posts";
import { cn } from "@/app/lib/utils";

export default function MapPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // 位置情報の取得
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (err) => {
            console.warn("位置情報の取得に失敗しました");
          }
        );
      }

      // 実際の投稿データの取得
      try {
        const result = await getPosts();
        if (result.success) {
          // 座標がある投稿のみを抽出
          const postsWithLocation = result.data?.filter((p: any) => p.latitude && p.longitude) || [];
          setPosts(postsWithLocation);
        }
      } catch (e) {
        console.error("Failed to fetch posts:", e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md px-5 py-4 border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Navigation size={20} />
          </div>
          <h1 className="font-black text-lg text-gray-800 tracking-tight">ご近所マップ</h1>
        </div>
        <Link href="/profile/edit" className="text-gray-400 p-2 hover:bg-gray-50 rounded-full transition-all">
          <Settings size={20} />
        </Link>
      </header>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* マップ代わり（デモ用ビジュアル） */}
        <div className="flex-1 bg-[#E5E7EB] relative flex items-center justify-center overflow-hidden">
          {/* グリッド背景 */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#9CA3AF 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          {error ? (
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[32px] shadow-xl border border-red-50 max-w-xs text-center space-y-4 relative z-10">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center text-red-500 mx-auto">
                <Info size={32} />
              </div>
              <p className="text-sm font-bold text-gray-800">{error}</p>
              <button onClick={() => window.location.reload()} className="w-full py-3 bg-primary text-white rounded-2xl font-black text-xs">再試行する</button>
            </div>
          ) : (
            <>
              {/* 自分自身 */}
              <div className="relative z-10 transition-all duration-1000">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-ping absolute inset-0"></div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-primary relative z-10 overflow-hidden">
                  <User size={24} className="text-primary" />
                </div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap">あなた</div>
              </div>

              {/* 実際の投稿をマップ上に配置（デモ用にランダム配置） */}
              {posts.map((post, i) => (
                <div 
                  key={post.id} 
                  className="absolute animate-bounce" 
                  style={{ 
                    top: `${20 + (i * 15) % 60}%`, 
                    left: `${15 + (i * 25) % 70}%`,
                    animationDuration: `${3 + (i % 3)}s` 
                  }}
                >
                  <Link href={`/post/${post.id}`}>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-secondary overflow-hidden active:scale-90 transition-transform">
                      {post.image_url ? (
                        <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-orange-50 flex items-center justify-center text-secondary italic font-black text-xs">
                          {post.author?.display_name?.charAt(0) || 'M'}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-gray-800 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-gray-100 whitespace-nowrap max-w-[100px] truncate">
                    {post.title}
                  </div>
                </div>
              ))}

              {posts.length === 0 && !loading && (
                <div className="text-center space-y-2 opacity-40">
                  <Sparkles size={32} className="mx-auto text-gray-400" />
                  <p className="text-[10px] font-bold">近くに投稿はありません</p>
                </div>
              )}
            </>
          )}

          {/* 右下ボタン */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-3">
            <button className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-gray-600 active:scale-90 transition-transform">
              <MapPin size={24} />
            </button>
          </div>
        </div>

        {/* 下部案内カード */}
        <div className="bg-white px-6 py-8 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", posts.length > 0 ? "bg-green-500" : "bg-gray-300")}></div>
              <h2 className="text-xl font-black text-gray-800">
                {posts.length > 0 ? `近くに${posts.length}件の募集があります` : "近くに募集はありません"}
              </h2>
            </div>
            <p className="text-xs text-gray-400 font-medium">「助け合い」ができる近所のママを探してみましょう。</p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {posts.map((post) => (
              <div key={post.id} className="min-w-[280px] bg-gray-50 p-4 rounded-[24px] border border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-white overflow-hidden flex-shrink-0 border border-gray-100">
                    {post.image_url ? (
                      <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary italic font-black text-xs bg-primary/5">
                        {post.author?.display_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-gray-800 truncate">{post.title}</p>
                    <p className="text-[10px] text-gray-400 truncate">{post.location_name || "現在地付近"}</p>
                  </div>
                </div>
                <Link 
                  href={`/post/${post.id}`}
                  className="p-2.5 bg-white rounded-xl text-primary shadow-sm active:scale-90 transition-transform flex-shrink-0"
                >
                  <Info size={18} />
                </Link>
              </div>
            ))}
            
            {posts.length === 0 && !loading && (
              <div className="w-full py-4 text-center">
                <p className="text-[10px] text-gray-400 font-bold">まだ投稿がありません。最初の投稿をしてみませんか？</p>
                <Link href="/post/new" className="inline-block mt-3 px-6 py-2 bg-primary text-white rounded-full text-[10px] font-black">
                  投稿を作成する
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <TabBar />
    </div>
  );
}
