"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Heart, X, MapPin, BadgeCheck, Clock, Users, MessageSquare } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface SwipeCardProps {
  post: any;
  onSwipe: (direction: "left" | "right") => void;
}

export function SwipeCard({ post, onSwipe }: SwipeCardProps) {
  const [exitX, setExitX] = useState<number>(0);
  const x = useMotionValue(0);
  
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  // 判定インジケーターのスタイル
  const likeOpacity = useTransform(x, [50, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -120], [0, 1]);
  const likeScale = useTransform(x, [50, 120], [0.8, 1.1]);
  const nopeScale = useTransform(x, [-50, -120], [0.8, 1.1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      handleButtonClick("right");
    } else if (info.offset.x < -threshold) {
      handleButtonClick("left");
    }
  };

  const handleButtonClick = (direction: "left" | "right") => {
    setExitX(direction === "right" ? 1000 : -1000);
    onSwipe(direction);
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute w-full h-full bg-white rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] border border-gray-50 overflow-hidden cursor-grab active:cursor-grabbing touch-none flex flex-col"
    >
      {/* 判定オーバーレイ - 洗練されたバッジ風 */}
      <motion.div 
        style={{ opacity: likeOpacity, scale: likeScale }} 
        className="absolute top-20 left-10 z-30 border-4 border-[#87A96B] text-[#87A96B] font-black text-3xl px-6 py-2 rounded-2xl rotate-[-12deg] pointer-events-none uppercase tracking-tighter"
      >
        Nice!
      </motion.div>
      <motion.div 
        style={{ opacity: nopeOpacity, scale: nopeScale }} 
        className="absolute top-20 right-10 z-30 border-4 border-[#E2725B] text-[#E2725B] font-black text-3xl px-6 py-2 rounded-2xl rotate-[12deg] pointer-events-none uppercase tracking-tighter"
      >
        Skip
      </motion.div>

      {/* カード上部：ユーザー情報（さりげなく） */}
      <div className="p-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-50 overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
            {post.author?.avatar_url ? (
              <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm font-black italic bg-gray-50">
                {post.author?.display_name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900 text-sm tracking-tight">{post.author?.display_name || 'ママ'}</span>
              {post.author?.is_kyc_verified && <BadgeCheck size={14} className="text-blue-500 fill-white" />}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">信頼度 {post.author?.trust_score || 100}</span>
          </div>
        </div>
        
        <div className={cn(
          "px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm",
          post.mode === 'tasukete' ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
        )}>
          {post.mode === 'tasukete' ? 'たすけて' : 'あそぼ'}
        </div>
      </div>

      {/* メイン：メッセージエリア */}
      <div className="flex-1 px-8 py-4 flex flex-col justify-center text-center relative overflow-hidden">
        {post.image_url && (
          <div className="absolute inset-0 z-0 opacity-20 blur-[2px]">
            <img src={post.image_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10">
          {post.image_url ? (
            <div className="mb-6 flex justify-center">
              <div className="w-40 h-40 rounded-[32px] overflow-hidden shadow-xl ring-4 ring-white">
                <img src={post.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          ) : (
            <div className="mb-6 opacity-20 flex justify-center text-primary">
              <MessageSquare size={32} />
            </div>
          )}
          <h3 className="text-2xl font-black text-gray-900 leading-[1.4] tracking-tight mb-6 line-clamp-2 px-2">
            {post.title}
          </h3>
          <p className="text-[14px] text-gray-500 leading-relaxed font-medium line-clamp-4 px-4">
            {post.content}
          </p>
        </div>
      </div>

      {/* 下部：詳細情報（アイコンを小さく整理） */}
      <div className="px-8 pb-10">
        <div className="flex items-center justify-center gap-6 mb-10 text-gray-400 font-bold border-t border-gray-50 pt-8">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-primary/60" />
            <span className="text-[11px]">{post.location_name || "世田谷区"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-primary/60" />
            <span className="text-[11px]">{post.max_participants}名募集</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-primary/60" />
            <span className="text-[11px]">{new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
          </div>
        </div>

        {/* アクションボタン：より丸みを帯びた、触りたくなるデザイン */}
        <div className="flex justify-center gap-10">
          <button 
            onClick={(e) => { e.stopPropagation(); handleButtonClick("left"); }}
            className="w-16 h-16 rounded-full bg-white shadow-[0_10px_25px_rgba(226,114,91,0.15)] flex items-center justify-center text-[#E2725B] hover:bg-[#E2725B]/5 transition-all active:scale-90 border border-gray-50"
          >
            <X size={28} strokeWidth={3.5} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleButtonClick("right"); }}
            className="w-16 h-16 rounded-full bg-[#87A96B] shadow-[0_15px_30px_rgba(135,169,107,0.3)] flex items-center justify-center text-white transition-all active:scale-90"
          >
            <Heart size={28} strokeWidth={3.5} fill="white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
