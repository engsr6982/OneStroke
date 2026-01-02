// ======================== 模型提供商模板 ========================
export const ModelProviderTemplate = {
  qianwen: {
    label: '阿里云 - 通义千问',
    model: 'qwen3-max',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
  openai: {
    label: 'OpenAI',
    model: 'gpt-5',
    baseUrl: 'https://api.openai.com/v1',
  },
  other: {
    label: '其他',
    model: '',
    baseUrl: '',
  },
} as const

// ======================== 扩展设置类型 ========================

export type ModelProvider = keyof typeof ModelProviderTemplate

export interface ModelConfig {
  provider: ModelProvider
  apiKey: string
  baseUrl: string
  model: string
}

export interface PromptConfig {
  summarize: string
  note: string
  explain: string
}
export type PromptKeys = keyof PromptConfig

// ======================== 会话存储模型 ========================

export type SessionType = PromptKeys | 'chat'

export interface MessageContext {
  text: string
  sourceUrl?: string
}

export type MessageRole = 'system' | 'user' | 'assistant' // 系统 / 用户 / 助手

export interface ChatMessage {
  role: MessageRole // 角色
  content: string // 消息内容
  context?: MessageContext[] // 上下文
}

export type SessionID = string // 会话ID (UUID)

export interface SessionData {
  id: SessionID
  type: SessionType // 会话类型
  messages: ChatMessage[] // 消息列表
  totalToken: number // 总token数
}

export interface SessionMeta {
  id: SessionID
  title: string // 标题(截取首个user消息前20字符)
  preview: string // 预览内容(截取首个assistant消息前50字符)
  type: SessionType // 会话类型
  createdAt: number // 创建时间
  updatedAt: number // 更新时间
}

// ======================== 会话存储 ========================

export type SessionStorageKey = `session_${SessionID}`

export type SessionMetas = SessionMeta[]
