export interface ModelDescriptor {
  label: string
  model: string
  baseUrl: string
}

export const AiProvider = {
  qianwen: {
    label: '阿里 - 通义千问',
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

export interface AiConfig {
  provider: keyof typeof AiProvider
  apiKey: string
  baseUrl: string
  model: string
}

export interface PromptConfig {
  summarize: string
  note: string
  explain: string
}

export interface HistoryItem {
  id: string
  type: 'summary' | 'note' | 'explain'
  originalText: string
  result: string
  timestamp: number
}

// 默认配置常量
export const DEFAULT_CONFIG: AiConfig = {
  provider: 'qianwen',
  apiKey: '',
  baseUrl: AiProvider['qianwen'].baseUrl,
  model: AiProvider['qianwen'].model,
}

export const DEFAULT_PROMPTS: PromptConfig = {
  summarize: '请简要总结以下内容，提取核心论点，字数控制在原文的30%以内：',
  note: '请整理以下内容的学习笔记，使用Markdown列表格式，提取关键知识点：',
  explain: '请解释以下内容中的专业术语、复杂句式或背景知识，使其通俗易懂：',
}
