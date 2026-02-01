"use client";

import Link from "next/link";
import { Bell, MapPin } from "lucide-react";
import { useRealtime } from "@/app/components/realtime/RealtimeProvider";

export function Header() {
  const { notificationsCount } = useRealtime();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-primary font-black text-xl tracking-tighter">MamaLink</h1>
        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
          <MapPin size={10} className="text-primary" />
          <span>世田谷区</span>
        </div>
      </div>
      <Link href="/notifications" className="relative p-2.5 text-gray-400 hover:bg-gray-50 rounded-2xl transition-all active:scale-95">
        <Bell size={20} />
        {notificationsCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-secondary text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center">
            {notificationsCount > 9 ? '9+' : notificationsCount}
          </span>
        )}
      </Link>
    </header>
  );
}
