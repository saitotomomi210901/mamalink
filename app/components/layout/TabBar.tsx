"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map as MapIcon, PlusCircle, User, Bell } from "lucide-react";
import { cn } from "@/app/lib/utils";

export function TabBar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "ホーム" },
    { href: "/map", icon: MapIcon, label: "マップ" },
    { href: "/post/new", icon: PlusCircle, label: "投稿", isAction: true },
    { href: "/notifications", icon: Bell, label: "通知" },
    { href: "/profile", icon: User, label: "マイページ" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-around py-2 pb-safe-offset-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        
        if (item.isAction) {
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 text-secondary -mt-6">
              <div className="bg-secondary text-white p-3.5 rounded-full shadow-xl shadow-secondary/20 active:scale-90 transition-transform">
                <item.icon size={28} />
              </div>
              <span className="text-[10px] mt-1 text-secondary font-black">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className={cn(
              "text-[10px] font-bold",
              isActive ? "text-primary" : "text-gray-400"
            )}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
