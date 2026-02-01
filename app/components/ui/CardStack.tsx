"use client";

import React, { useState, useTransition } from "react";
import { SwipeCard } from "./SwipeCard";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, MessageCircle, RefreshCcw, Sparkles } from "lucide-react";
import { handleSwipe as saveSwipeAction } from "@/app/actions/matches";

interface CardStackProps {
  initialPosts: any[];
}

export function CardStack({ initialPosts }: CardStackProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [showMatch, setShowMatch] = useState(false);

  const handleSwipe = (direction: "left" | "right") => {
    const post = posts[currentIndex];
    const actionType = direction === "right" ? "like" : "skip";

    // データベースに保存
    startTransition(async () => {
      const result = await saveSwipeAction(post.id, actionType);
      if (result.success && actionType === 'like') {
        // マッチング演出などをここに追加できる
        // 今回は簡易的に演出フラグを立てる
        setShowMatch(true);
        setTimeout(() => setShowMatch(false), 3000);
      }
    });

    // 次のカードへ（少し遅らせてアニメーションを完了させる）
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 200);
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto h-[550px] mt-4">
      <AnimatePresence>
        {showMatch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-[40px] border-4 border-primary/20 p-8 text-center space-y-4 shadow-2xl"
          >
            <div className="bg-primary text-white p-4 rounded-full shadow-lg animate-bounce">
              <Heart size={40} fill="white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Nice! 送信完了</h3>
            <p className="text-sm text-gray-500 font-bold leading-relaxed">
              相手があなたを気に入ると<br />マッチング成立です！
            </p>
            <div className="flex gap-2 text-primary">
              <Sparkles size={20} />
              <Sparkles size={20} className="mt-4" />
              <Sparkles size={20} />
            </div>
          </motion.div>
        )}

        {currentIndex < posts.length ? (
          <div className="relative w-full h-full">
            {/* 重なりの背景カード（視覚的な奥行き） */}
            {currentIndex + 1 < posts.length && (
              <div className="absolute top-4 left-0 w-full h-[500px] bg-gray-50 rounded-[32px] border border-gray-100 scale-[0.95] opacity-50 translate-y-2 -z-10" />
            )}
            
            {/* メインのカード */}
            <SwipeCard 
              key={posts[currentIndex].id}
              post={posts[currentIndex]} 
              onSwipe={handleSwipe} 
            />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-[500px] text-center space-y-6 px-8"
          >
            <div className="bg-primary/10 p-6 rounded-full text-primary">
              <RefreshCcw size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-800 tracking-tight">すべてチェックしました！</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                新しい投稿が届くまで待つか、<br />
                設定を変えてみてください。
              </p>
            </div>
            <button 
              onClick={handleReset}
              className="px-8 py-4 bg-primary text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-transform"
            >
              もう一度見る
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
