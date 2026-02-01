'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { createClient } from '@/lib/supabase/server'

/**
 * 新規投稿を作成
 */
export async function createPost(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('認証が必要です')

    const mode = formData.get('mode') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const location_name = formData.get('location_name') as string
    const scheduled_at = formData.get('scheduled_at') as string
    const max_participants = parseInt(formData.get('max_participants') as string || '1')
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
    const imageFile = formData.get('image') as File | null

    if (!title || !content || !mode) {
      throw new Error('必須項目が入力されていません')
    }

    const supabase = createServiceRoleClient()
    let image_url = null

    // 画像のアップロード処理
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, imageFile)

      if (uploadError) {
        console.error('Image upload error:', uploadError)
        throw new Error('画像のアップロードに失敗しました')
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath)
      
      image_url = publicUrl
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: userId,
        mode,
        title,
        content,
        location_name,
        latitude,
        longitude,
        image_url,
        scheduled_at: scheduled_at ? new Date(scheduled_at).toISOString() : null,
        max_participants,
        status: 'open'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase 挿入エラー:', error)
      throw new Error('データベースへの保存に失敗しました')
    }

    // キャッシュを更新して、ホーム画面に即座に反映させる
    revalidatePath('/')
    return { success: true, data }
  } catch (error) {
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
