const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8')
const env = {}
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=')
  if (key && value) {
    env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '')
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log('データの確認と作成を開始します...')

  // 1. ターゲットユーザーの取得
  const { data: profiles } = await supabase.from('profiles').select('id').not('id', 'ilike', 'dummy-user%')
  const myId = profiles[0].id
  console.log('ターゲットユーザーID:', myId)

  // 2. 自分の投稿を1つ取得
  const { data: myPosts } = await supabase.from('posts').select('id').eq('author_id', myId).limit(1)
  if (!myPosts || myPosts.length === 0) {
    console.error('自分の投稿が見つかりません。投稿を1つ作成してください。')
    process.exit(1)
  }
  const postId = myPosts[0].id

  // 3. マッチングデータを作成
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .upsert({
      post_id: postId,
      user_id: 'dummy-user-1',
      status: 'accepted'
    }, { onConflict: 'post_id,user_id' })
    .select()
    .single()

  if (matchError) {
    console.error('Match error:', matchError)
    process.exit(1)
  }

  // 4. チャットを作成
  const dummyChats = [
    {
      match_id: match.id,
      sender_id: 'dummy-user-1',
      content: 'こんにちは！ぜひお願いしたいです。当日はよろしくお願いします！',
      created_at: new Date().toISOString(),
    }
  ]

  const { error: chatError } = await supabase.from('chats').insert(dummyChats)
  
  if (chatError) {
    console.error('Chat insert error:', chatError)
  } else {
    console.log('ダミーチャットの作成に成功しました。')
  }
}

seed()
