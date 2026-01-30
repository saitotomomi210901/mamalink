# API仕様書

## 1. 設計原則
- **RESTful API**: リソースに基づいた直感的なエンドポイント設計。
- **JSONベース**: リクエスト/レスポンスはすべてJSON形式。
- **認証必須**: パブリックなエンドポイントを除き、Clerkによる認証を必須とする。

## 2. 認証・認可
- **JWT (Json Web Token)**: Clerkから発行されるトークンを `Authorization: Bearer <token>` ヘッダーに乗せて送信。
- **RLS (Row Level Security)**: Supabase側でデータレベルの認可を制御。

## 3. エンドポイント一覧

### 3.1 投稿関連 (Posts)

#### `GET /api/posts/nearby`
近隣の募集を検索。
- **Query Params**: `lat`, `lng`, `radius`, `mode`
- **Response**:
```json
[
  {
    "id": "uuid",
    "title": "公園で遊びませんか？",
    "distance": 0.5,
    "author": { "display_name": "美咲", "trust_score": 120 }
  }
]
```

#### `POST /api/posts`
新規募集を投稿。
- **Request**:
```json
{
  "mode": "tasukete",
  "title": "30分見守り依頼",
  "location_name": "〇〇児童館",
  "scheduled_at": "2026-02-01T14:00:00Z"
}
```

### 3.2 マッチング・チャット関連 (Matches/Chats)

#### `POST /api/matches`
募集に応募する。
- **Request**: `{ "post_id": "uuid" }`

#### `GET /api/chats/:match_id`
チャット履歴の取得。
- **Response**:
```json
[
  {
    "id": "uuid",
    "sender_id": "uuid",
    "content": "よろしくお願いします！",
    "created_at": "..."
  }
]
```

### 3.3 プロフィール・信頼スコア (Profiles)

#### `GET /api/profile/:id`
ユーザー情報の取得。信頼スコアやバッジを含む。

## 4. エラーレスポンス
標準的なHTTPステータスコードを使用。
- `400 Bad Request`: バリデーションエラー。
- `401 Unauthorized`: 認証エラー。
- `403 Forbidden`: 権限エラー（本人以外の編集等）。
- `404 Not Found`: リソース不在。
