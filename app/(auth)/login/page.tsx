"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, ShieldCheck, Heart } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white px-6 flex flex-col justify-between py-12">
      <div className="space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-primary tracking-tight">MamaLink</h1>
          <p className="text-gray-500 font-medium leading-relaxed">
            「孤育て」をなくし、<br />
            地域で助け合えるセーフティネット。
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl text-primary">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">本人確認の徹底</p>
              <p className="text-xs text-gray-400">eKYCによる厳格な審査で安心</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-secondary/10 p-3 rounded-2xl text-secondary">
              <Heart size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">お互い様の助け合い</p>
              <p className="text-xs text-gray-400">罪悪感のない、等身大の支え合い</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => router.push("/sign-in")}
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:opacity-95 transition-all"
        >
          はじめる
        </button>
        <p className="text-center text-[10px] text-gray-400 px-4 leading-relaxed">
          「はじめる」をタップすることで、当サービスの<span className="underline">利用規約</span>および<span className="underline">プライバシーポリシー</span>に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
