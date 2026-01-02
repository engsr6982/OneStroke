import { appendSession } from './helper'
import { DEFAULT_PROMPTS } from './types/constant'
import type { PromptKeys, SessionData, SessionType } from './types/storage'

function randomText(length: number) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '
  let text = ''
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return text
}

export async function generateTestData(count = 30) {
  debugger
  const types: SessionType[] = ['note', 'explain', 'summarize']

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)] as PromptKeys
    const totalToken = Math.floor(Math.random() * 1000) + 50

    const data: SessionData = {
      id: crypto.randomUUID(),
      type,
      totalToken,
      messages: [
        {
          role: 'system',
          content: DEFAULT_PROMPTS[type],
        },
        {
          role: 'user',
          content: randomText(50 + Math.floor(Math.random() * 50)), // 用户消息 50~100 字
        },
        {
          role: 'assistant',
          content: randomText(80 + Math.floor(Math.random() * 50)), // AI 响应 80~130 字
        },
      ],
    }

    await appendSession(data)
  }
}
