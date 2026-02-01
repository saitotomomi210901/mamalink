'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

/**
 * プロフィール情報を更新
 */
export async function updateProfile(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('認証が必要です')

    const display_name = formData.get('display_name') as string
    const bio = formData.get('bio') as string
    const area = formData.get('area') as string
    
    // 興味関心（複数選択）
    const interests = formData.getAll('interests') as string[]
    
    // 子供の情報
    const children_count = parseInt(formData.get('children_count') as string || '0')
    const children_age = formData.get('children_age') as string
    
    // マップ表示設定
    const share_location = formData.get('share_location') === 'true'
    
    const children_info = {
      count: children_count,
      age_summary: children_age
    }

    const supabase = createServiceRoleClient()

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name,
        bio,
        area,
        interests,
        children_info,
        share_location,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Supabase 更新エラー:', error)
      throw new Error('プロフィールの更新に失敗しました')
    }

    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '予期せぬエラーが発生しました' 
    }
  }
}
