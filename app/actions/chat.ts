'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

/**
 * メッセージを送信する
 */
export async function sendMessage(postId: string, receiverId: string, content: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('認証が必要です')

    const supabase = createServiceRoleClient()

    // postId が UUID でない場合（'direct-...' など）は null にする
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId);
    const dbPostId = isUuid ? postId : null;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        post_id: dbPostId,
        sender_id: userId,
        receiver_id: receiverId,
        content: content.trim()
      })
      .select()
      .single()

    if (error) {
      console.error('メッセージ送信エラー:', error)
      throw new Error('メッセージの送信に失敗しました')
    }

    // リアルタイム通知とメッセージ送信
    // 1. チャットルーム内の全員にメッセージをブロードキャスト
    await supabase.rpc('realtime_send', {
      p_topic: `chat:${postId}`,
      p_event: 'new_message',
      p_payload: { ...data }
    });

    // 2. 受信者に通知をブロードキャスト
    await supabase.rpc('realtime_send', {
      p_topic: `user:${receiverId}:notifications`,
      p_event: 'new_notification',
      p_payload: { 
        type: 'chat_message', 
        sender_id: userId,
        content: content.substring(0, 50)
      }
    });

    revalidatePath(`/chat/${postId}`)
    return { success: true, data }
  } catch (error) {
    console.error('Send message error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '予期せぬエラーが発生しました' 
    }
  }
}

/**
 * 特定の投稿に関するメッセージ履歴を取得
 */
export async function getMessages(postId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: '認証が必要です' }

    const supabase = createServiceRoleClient()
    
    // postId が UUID でない場合は receiver_id をキーに取得を試みる
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId);
    
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(display_name, avatar_url),
        receiver:profiles!receiver_id(display_name, avatar_url)
      `)

    if (isUuid) {
      query = query.eq('post_id', postId);
    } else if (postId.startsWith('direct-')) {
      const targetId = postId.replace('direct-', '');
      query = query
        .is('post_id', null)
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${userId})`);
    } else {
      return { success: true, data: [] };
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Get messages error:', error)
    return { success: false, error: 'メッセージの取得に失敗しました' }
  }
}
