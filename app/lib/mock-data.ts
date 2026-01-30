export const mockPosts = [
  {
    id: "1",
    author_id: "u1",
    author: {
      display_name: "美咲",
      trust_score: 120,
      avatar_url: "/avatars/mama1.jpg",
      is_kyc_verified: true,
      children_info: { count: 1, ages: [8] },
      hobbies: ["料理", "散歩"]
    },
    mode: "tasukete",
    title: "30分ほど見守りをお願いしたいです",
    content: "急な仕事の電話が入ってしまい、同じカフェ内にいる方で少しだけ子どもを見ていていただける方を探しています。",
    location_name: "カフェ・ド・ママ 世田谷店",
    scheduled_at: "2026-02-01T14:00:00Z",
    max_participants: 1,
    status: "open"
  },
  {
    id: "2",
    author_id: "u2",
    author: {
      display_name: "裕子",
      trust_score: 150,
      avatar_url: "/avatars/mama2.jpg",
      is_kyc_verified: true,
      children_info: { count: 2, ages: [3, 6] },
      hobbies: ["読書", "ヨガ"]
    },
    mode: "asobo",
    title: "〇〇公園でピクニックしませんか？",
    content: "天気が良いので、お昼頃から公園で集まりたいです。お弁当を持って気楽に集まりましょう！",
    location_name: "世田谷公園",
    scheduled_at: "2026-02-05T11:00:00Z",
    max_participants: 5,
    status: "open"
  }
];

export const currentUser = {
  id: "curr",
  display_name: "さくら",
  trust_score: 100,
  is_kyc_verified: true,
  avatar_url: "/avatars/me.jpg"
};
