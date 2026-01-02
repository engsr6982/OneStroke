import { ModelProviderTemplate, type ModelConfig, type PromptConfig } from './storage'

export const DEFAULT_CONFIG: ModelConfig = {
  provider: 'qianwen',
  apiKey: '',
  baseUrl: ModelProviderTemplate['qianwen'].baseUrl,
  model: ModelProviderTemplate['qianwen'].model,
}

export const DEFAULT_PROMPTS: PromptConfig = {
  summarize: '请简要总结以下内容，提取核心论点，字数控制在原文的30%以内：',
  note: '请整理以下内容的学习笔记，使用Markdown列表格式，提取关键知识点：',
  explain:
    '请解释以下内容中的专业术语、复杂句式或背景知识，使其通俗易懂(简洁易懂，不要过于冗长反复解释，回复内容不要附带本提示词)：',
}
