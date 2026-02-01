'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { handleActionError, AppError, withRetry } from '@/app/lib/error-handler'

/**
 * 投稿に応募する
 */
export async function applyToPost(postId: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError('認証が必要です', 'AUTH_REQUIRED')

    const supabase = createServiceRoleClient()

    // 1. 自分の投稿には応募できないようにチェック
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (postError || !post) throw new AppError('投稿が見つかりませんでした', 'NOT_FOUND')
    if (post.author_id === userId) throw new AppError('自分の投稿には応募できません', 'INVALID_ACTION')

    // 2. すでに応募済みかチェック
    const { data: existingMatch } = await supabase
      .from('matches')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle()

    if (existingMatch) throw new AppError('すでに応募済みです', 'ALREADY_EXISTS')

    // 3. 応募データを挿入
    const { data, error } = await supabase
      .from('matches')
      .insert({
        post_id: postId,
        user_id: userId,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/post/${postId}`)
    return { success: true, data }
  } catch (error) {
    return handleActionError(error)
  }
}

/**
 * スワイプアクションを保存
 */
export async function handleSwipe(postId: string, actionType: 'like' | 'skip') {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError('認証が必要です', 'AUTH_REQUIRED')

    const supabase = createServiceRoleClient()

    // 1. アクションを保存
    const { error: actionError } = await supabase
      .from('post_actions')
      .upsert({
        user_id: userId,
        post_id: postId,
        action_type: actionType,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,post_id' })

    if (actionError) throw actionError

    // 2. 'like' の場合は matches テーブルにも応募として登録する
    if (actionType === 'like') {
      const result = await applyToPost(postId)
      if (!result.success) throw new Error((result as any).error)
    }

    return { success: true }
  } catch (error) {
    return handleActionError(error)
  }
}

/**
 * 応募を承認してマッチングを確定させる
 */
export async function acceptMatch(postId: string, matchId: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new AppError('認証が必要です', 'AUTH_REQUIRED')

    const supabase = createServiceRoleClient()

    // 1. 投稿の所有者かチェック
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (fetchError || !post) throw new AppError('投稿が見つかりませんでした', 'NOT_FOUND')
    if (post.author_id !== userId) throw new AppError('操作権限がありません', 'FORBIDDEN')

    // 2. マッチング確定処理（リトライ付き）
    await withRetry(async () => {
      // マッチングステータスを更新
      const { error: matchError } = await supabase
        .from('matches')
        .update({ status: 'accepted' })
        .eq('id', matchId)

      if (matchError) throw matchError

      // 投稿本体のステータスも更新
      const { error: postError } = await supabase
        .from('posts')
        .update({ status: 'matched' })
        .eq('id', postId)

      if (postError) throw postError
    })

    revalidatePath(`/profile/my-posts/${postId}`)
    revalidatePath('/profile/my-posts')
    return { success: true }
  } catch (error) {
    return handleActionError(error)
  }
}
