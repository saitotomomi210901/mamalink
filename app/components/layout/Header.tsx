import Link from "next/link";
import { Bell, MapPin } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-primary font-bold text-xl tracking-tight">MamaLink</h1>
        <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
          <MapPin size={12} />
          <span>世田谷区</span>
        </div>
      </div>
      <button className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
        <Bell size={22} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
      </button>
    </header>
  );
}
