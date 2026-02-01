/**
 * MamaLink カスタムエラークラス
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * サーバーアクション用の共通エラーハンドラ
 */
export async function handleActionError(error: unknown) {
  console.error('[Action Error]:', error);

  if (error instanceof AppError) {
    return { success: false, error: error.message, code: error.code };
  }

  if (error instanceof Error) {
    // SupabaseやClerkの特定のエラーメッセージをユーザーフレンドリーに変換
    if (error.message.includes('PGRST116')) {
      return { success: false, error: 'データが見つかりませんでした' };
    }
    if (error.message.includes('policy')) {
      return { success: false, error: '操作権限がありません' };
    }
    return { success: false, error: error.message };
  }

  return { success: false, error: '予期せぬエラーが発生しました' };
}

/**
 * リトライロジック付きの実行
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}
