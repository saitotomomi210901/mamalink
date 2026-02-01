"use client";

import { useEffect, useState } from "react";
import { TabBar } from "@/app/components/layout/TabBar";
import { MapPin, Navigation, User, Info, Settings, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function MapPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          setError("位置情報の取得に失敗しました。設定を確認してください。");
        }
      );
    } else {
      setError("お使いのブラウザは位置情報をサポートしていません。");
    }
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
              <div className="relative z-10">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-ping absolute inset-0"></div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-primary relative z-10 overflow-hidden">
                  <User size={24} className="text-primary" />
                </div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap">あなた</div>
              </div>

              {/* 周辺ユーザー（デモ用） */}
              <div className="absolute top-1/4 left-1/4 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-secondary overflow-hidden">
                  <div className="w-full h-full bg-orange-100 flex items-center justify-center text-secondary italic font-black text-xs">Y</div>
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-gray-800 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-gray-100 whitespace-nowrap">ゆいママ (300m)</div>
              </div>

              <div className="absolute bottom-1/3 right-1/4 animate-bounce" style={{ animationDuration: '4s' }}>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-primary/40 overflow-hidden">
                  <div className="w-full h-full bg-green-50 flex items-center justify-center text-primary italic font-black text-xs">M</div>
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-gray-800 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-gray-100 whitespace-nowrap">ミキ (500m)</div>
              </div>
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
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-black text-gray-800">近くに2人のママがいます</h2>
            </div>
            <p className="text-xs text-gray-400 font-medium">「助け合い」ができる近所のママを探してみましょう。</p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'demo-1', name: 'ゆいママ', time: '徒歩5分', tag: '公園遊び', color: 'bg-orange-100 text-secondary', char: 'Y' },
              { id: 'demo-2', name: 'ミキ', time: '徒歩8分', tag: '離乳食', color: 'bg-green-50 text-primary', char: 'M' }
            ].map((user) => (
              <div key={user.id} className="min-w-[240px] bg-gray-50 p-4 rounded-[24px] border border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${user.color}`}>{user.char}</div>
                  <div>
                    <p className="text-xs font-black text-gray-800">{user.name}</p>
                    <p className="text-[10px] text-gray-400">{user.time} / {user.tag}</p>
                  </div>
                </div>
                <Link 
                  href={`/chat/direct-${user.id}?receiverId=${user.id}`}
                  className="p-2.5 bg-white rounded-xl text-primary shadow-sm active:scale-90 transition-transform"
                >
                  <MessageSquare size={18} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      <TabBar />
    </div>
  );
}
