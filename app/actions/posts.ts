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

    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: userId,
        mode,
        title,
        content,
        location_name,
        scheduled_at: scheduled_at ? new Date(scheduled_at).toISOString() : null,
        max_participants,
        status: 'open'
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/')
    return { success: true, data }
  } catch (error) {
    console.error('Create post error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '投稿の作成に失敗しました' 
    }
  }
}

/**
 * 近所の投稿を取得 (現在は全取得)
 */
export async function getPosts() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles(display_name, trust_score, avatar_url, is_kyc_verified)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Get posts error:', error)
    return { success: false, error: '投稿の取得に失敗しました' }
  }
}

/**
 * 特定の投稿を取得
 */
export async function getPostById(id: string) {
  try {
    const supabase = await createClient()
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

/**
 * 投稿を削除
 */
export async function deletePost(id: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('認証が必要です')

    const supabase = await createClient()
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('author_id', userId) // 本人のみ削除可能

    if (error) throw error

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Delete post error:', error)
    return { success: false, error: '削除に失敗しました' }
  }
}
