import { auth, currentUser } from '@clerk/nextjs/server'
import { createServiceRoleClient } from './service-role'

/**
 * Clerk のユーザー情報を Supabase の profiles テーブルに同期する
 * (upsert 処理)
 */
export async function ensureSupabaseUser() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  if (!user) return null

  const supabase = createServiceRoleClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        display_name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '名称未設定',
        avatar_url: user.imageUrl,
        is_kyc_verified: false, // 初期値
      },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (error) {
    console.error('Supabase ユーザー同期エラー:', error)
    throw error
  }
  
  return data
}

/**
 * 現在のログインユーザーの Supabase プロフィールを取得
 */
export async function getSupabaseProfile() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  return data
}
