"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@clerk/nextjs";
import { RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeContextType {
  notificationsCount: number;
  setNotificationsCount: (count: number) => void;
  supabase: any;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [notificationsCount, setNotificationsCount] = useState(0);
  const { userId, getToken } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      const token = await getToken({ template: "supabase" });
      if (!token) return;

      // SupabaseにClerkのトークンを設定
      await supabase.realtime.setAuth(token);

      // ユーザー固有の通知チャンネルを購読
      channel = supabase.channel(`user:${userId}:notifications`, {
        config: { private: true }
      });

      channel
        .on("broadcast", { event: "new_notification" }, (payload) => {
          console.log("New notification received:", payload);
          setNotificationsCount((prev) => prev + 1);
        })
        .subscribe((status) => {
          console.log(`Realtime subscription status: ${status}`);
        });
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, getToken, supabase]);

  return (
    <RealtimeContext.Provider value={{ notificationsCount, setNotificationsCount, supabase }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}
