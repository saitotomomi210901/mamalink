'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

/**
 * 助け合いを完了し、評価を投稿する
 */
export async function submitReview(postId: string, revieweeId: string, rating: number, comment: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('認証が必要です')

    const supabase = createServiceRoleClient()

    // 1. レビューを保存
    const { error: reviewError } = await supabase
      .from('reviews')
      .insert({
        post_id: postId,
        reviewer_id: userId,
        reviewee_id: revieweeId,
        rating,
        comment: comment.trim()
      })

    if (reviewError) {
      console.error('Review insert error:', reviewError)
      throw new Error('評価の保存に失敗しました')
    }

    // 2. 投稿ステータスを 'completed' に更新
    const { error: postError } = await supabase
      .from('posts')
      .update({ status: 'completed' })
      .eq('id', postId)

    if (postError) throw postError

    // 3. 被評価者の信頼スコアを更新（簡易的な計算: 星1つにつき+10点、最大1000点など）
    const { data: profile } = await supabase
      .from('profiles')
      .select('trust_score')
      .eq('id', revieweeId)
      .single()

    const currentScore = profile?.trust_score || 100
    const newScore = Math.min(currentScore + (rating * 10), 1000)

    await supabase
      .from('profiles')
      .update({ trust_score: newScore })
      .eq('id', revieweeId)

    revalidatePath(`/profile/my-posts/${postId}`)
    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Submit review error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '予期せぬエラーが発生しました' 
    }
  }
}
