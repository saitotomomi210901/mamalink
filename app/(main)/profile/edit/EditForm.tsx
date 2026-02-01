"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, User, MapPin, Baby, Sparkles, Info, Eye, EyeOff } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";

const INTEREST_OPTIONS = [
  "公園遊び", "離乳食", "保活", "習い事", 
  "読み聞かせ", "お出かけ", "お料理", "ママ友募集",
  "夜泣き対策", "幼児教育", "フォトスポット", "カフェ巡り"
];

interface EditFormProps {
  initialData: any;
}

export default function EditForm({ initialData }: EditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialData?.interests || []);
  const [shareLocation, setShareLocation] = useState<boolean>(initialData?.share_location || false);
  
  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    
    selectedInterests.forEach(interest => {
      formData.append("interests", interest);
    });
    formData.append("share_location", shareLocation.toString());

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        router.push("/profile");
        router.refresh();
      } else {
        setError(result.error || "エラーが発生しました");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-2">
          <Info size={16} />
          {error}
        </div>
      )}

      {/* 基本情報 */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h3 className="text-base font-black text-gray-800 tracking-tight">基本情報</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">表示名</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                name="display_name"
                type="text" 
                required
                defaultValue={initialData?.display_name || ''}
                placeholder="例: はなママ" 
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">居住エリア</label>
            <div className="relative">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                name="area"
                type="text" 
                defaultValue={initialData?.area || ''}
                placeholder="例: 東京都世田谷区" 
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">自己紹介</label>
            <textarea 
              name="bio"
              rows={4}
              defaultValue={initialData?.bio || ''}
              placeholder="好きなことや、普段の育児について教えてください" 
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
            ></textarea>
          </div>
        </div>
      </section>

      {/* 子供の情報 */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
          <h3 className="text-base font-black text-gray-800 tracking-tight">お子様の情報</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">人数</label>
            <select 
              name="children_count"
              defaultValue={initialData?.children_info?.count || '1'}
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-secondary/20 transition-all outline-none appearance-none"
            >
              <option value="1">1人</option>
              <option value="2">2人</option>
              <option value="3">3人</option>
              <option value="4">4人以上</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">年齢・月齢</label>
            <input 
              name="children_age"
              type="text" 
              defaultValue={initialData?.children_info?.age_summary || ''}
              placeholder="例: 2歳、0歳6ヶ月" 
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-secondary/20 transition-all outline-none"
            />
          </div>
        </div>
      </section>

          {/* 興味関心 */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-purple-400 rounded-full"></div>
              <h3 className="text-base font-black text-gray-800 tracking-tight">興味のあること</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    selectedInterests.includes(interest)
                      ? "bg-purple-500 text-white border-purple-500 shadow-md"
                      : "bg-white text-gray-400 border-gray-100 hover:border-purple-200"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </section>

          {/* プライバシー設定 */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-400 rounded-full"></div>
              <h3 className="text-base font-black text-gray-800 tracking-tight">プライバシー設定</h3>
            </div>

            <div className="bg-gray-50 p-5 rounded-[24px] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${shareLocation ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-400"}`}>
                  {shareLocation ? <Eye size={20} /> : <EyeOff size={20} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">マップに表示する</p>
                  <p className="text-[10px] text-gray-400 font-medium">オンにすると、近くのユーザーにあなたの位置が表示されます</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShareLocation(!shareLocation)}
                className={`w-12 h-6 rounded-full transition-all relative ${shareLocation ? "bg-primary" : "bg-gray-300"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${shareLocation ? "left-7" : "left-1"}`} />
              </button>
            </div>
          </section>

      <div className="pt-6">
        <button 
          type="submit"
          disabled={isPending}
          className="w-full py-5 bg-primary text-white font-black text-base rounded-[24px] shadow-xl shadow-primary/20 hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Save size={20} strokeWidth={3} />
              保存する
            </>
          )}
        </button>
      </div>
    </form>
  );
}
