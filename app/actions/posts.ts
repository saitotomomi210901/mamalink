'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { createClient } from '@/lib/supabase/server'
import { ensureSupabaseUser } from '@/lib/supabase/auth-helpers'

/**
 * 新規投稿を作成
 */
export async function createPost(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('認証が必要です')

    // プロフィールが存在することを確認
    await ensureSupabaseUser()

    const mode = formData.get('mode') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const location_name = formData.get('location_name') as string
    const scheduled_at_raw = formData.get('scheduled_at') as string
    const max_participants = parseInt(formData.get('max_participants') as string || '1')
    
    let scheduled_at = null
    if (scheduled_at_raw) {
      const date = new Date(scheduled_at_raw)
      if (!isNaN(date.getTime())) {
        scheduled_at = date.toISOString()
      }
    }

    if (!title || !content || !mode) {
      throw new Error('必須項目が入力されていません')
    }

    const supabase = createServiceRoleClient()
    // let image_url = null
    
    // ... (image upload code if needed, currently commented out in insert)

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: userId,
        mode,
        title,
        content,
        location_name,
        // latitude,
        // longitude,
        // image_url,
        scheduled_at,
        max_participants,
        status: 'open'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase 挿入エラー詳細:', error)
      throw new Error(`データベースへの保存に失敗しました: ${error.message}`)
    }

    // キャッシュを更新して、ホーム画面に即座に反映させる
    revalidatePath('/')
    return { success: true, data }
  } catch (error: any) {
    console.error('Create post error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '予期せぬエラーが発生しました' 
    }
  }
}

/**
 * 投稿一覧を取得 (スワイプ済みのものを除外)
 */
export async function getPosts() {
  try {
    const { userId } = await auth()
    const supabase = createServiceRoleClient()
    
    let query = supabase
      .from('posts')
      .select('*, author:profiles(display_name, trust_score, avatar_url, is_kyc_verified)')
      .order('created_at', { ascending: false })

    // ログインしている場合は、すでにスワイプした投稿を除外
    if (userId) {
      // 1. 自分のスワイプ済み投稿IDを取得
      const { data: actions } = await supabase
        .from('post_actions')
        .select('post_id')
        .eq('user_id', userId)

      const swipedPostIds = actions?.map(a => a.post_id) || []

      // 2. 自分の投稿も除外
      if (swipedPostIds.length > 0) {
        query = query.not('id', 'in', `(${swipedPostIds.join(',')})`)
      }
      query = query.neq('author_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    // Next.jsのビルド時の動的レンダリングエラーはそのまま投げる必要がある
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('Get posts error:', error)
    return { success: false, error: '投稿の取得に失敗しました' }
  }
}

/**
 * 特定の投稿を取得 (管理者権限で取得)
 */
export async function getPostById(id: string) {
  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles(display_name, trust_score, avatar_url, is_kyc_verified)')
      .eq('id', id)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Get post by id error:', error)
    return { success: false, error: '投稿の取得に失敗しました' }
  }
}
