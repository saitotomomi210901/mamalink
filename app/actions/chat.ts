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

    // 1. マッチングIDを取得（または作成）
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId);
    
    let matchId: string;
    if (isUuid) {
      const { data: match } = await supabase
        .from('matches')
        .select('id')
        .eq('post_id', postId)
        .or(`user_id.eq.${userId},user_id.eq.${receiverId}`)
        .single();
      
      if (!match) throw new Error('マッチングが見つかりません');
      matchId = match.id;
    } else {
      throw new Error('不正なリクエストです');
    }

    // 2. chatsテーブルに挿入
    const { data, error } = await supabase
      .from('chats')
      .insert({
        match_id: matchId,
        sender_id: userId,
        content: content.trim()
      })
      .select()
      .single()

    if (error) {
      console.error('メッセージ送信エラー詳細:', error)
      throw new Error(`メッセージの送信に失敗しました: ${error.message}`)
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
      .from('chats')
      .select(`
        *,
        sender:profiles!sender_id(display_name, avatar_url)
      `)

    if (isUuid) {
      // 投稿に紐づくマッチングIDを介して取得
      const { data: matches } = await supabase
        .from('matches')
        .select('id')
        .eq('post_id', postId);
      
      const matchIds = matches?.map(m => m.id) || [];
      if (matchIds.length === 0) return { success: true, data: [] };
      
      query = query.in('match_id', matchIds);
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
