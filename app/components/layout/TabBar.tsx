import Link from "next/link";
import { Home, Map as MapIcon, PlusCircle, User, Bell } from "lucide-react";

export function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-white border-t border-gray-100 flex items-center justify-around py-2 pb-safe-offset-2">
      <Link href="/" className="flex flex-col items-center gap-1 text-primary">
        <Home size={24} />
        <span className="text-[10px]">ホーム</span>
      </Link>
      <Link href="/map" className="flex flex-col items-center gap-1 text-gray-400">
        <MapIcon size={24} />
        <span className="text-[10px]">マップ</span>
      </Link>
      <Link href="/post/new" className="flex flex-col items-center gap-1 text-secondary -mt-6">
        <div className="bg-secondary text-white p-3 rounded-full shadow-lg">
          <PlusCircle size={28} />
        </div>
        <span className="text-[10px] mt-1 text-secondary font-medium">投稿</span>
      </Link>
      <Link href="/notifications" className="flex flex-col items-center gap-1 text-gray-400">
        <Bell size={24} />
        <span className="text-[10px]">通知</span>
      </Link>
      <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-400">
        <User size={24} />
        <span className="text-[10px]">マイページ</span>
      </Link>
    </nav>
  );
}
