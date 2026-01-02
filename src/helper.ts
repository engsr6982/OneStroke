/* 辅助工具 */
import { createApp, type Component } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {
  type MessageRole,
  type ModelConfig,
  type PromptConfig,
  type SessionData,
  type SessionID,
  type SessionMeta,
  type SessionMetas as SessionMetaRefs,
  type SessionStorageKey,
  type SessionType,
} from './types/storage'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export function createVueApp<T extends Component>(
  appComponent: T,
  mountPoint: string | HTMLElement,
  requireElementPlus = true,
) {
  const app = createApp(appComponent)

  if (requireElementPlus) {
    app.use(ElementPlus, {
      locale: zhCn,
    })
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }
  }
  return app.mount(mountPoint)
}

export const SessionTypes = ['summarize', 'note', 'explain', 'chat'] as const as SessionType[]
const TypeMapping = {
  summarize: { type: 'primary', name: '总结' },
  note: { type: 'warning', name: '笔记' },
  explain: { type: 'success', name: '解析' },
  chat: { type: 'info', name: '对话' },
} satisfies Record<SessionType, { type: string; name: string }>

// element-plus tag 类型映射
export const getTagRenderType = (tag: SessionType) => TypeMapping[tag].type
export const getTagRenderName = (tag: SessionType) => TypeMapping[tag].name

export const formatDate = (ts: number) => {
  return new Date(ts).toLocaleString('zh-CN', {
    hour12: false,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function deepCopy<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// 存储封装

export const ModelConfigStorageKey = 'model_config' as const
export const PromptConfigStorageKey = 'prompt_config' as const
export const SessionMetaRefsKey = 'session_meta_refs' as const

export const getModelConfig = async () => {
  const obj = await chrome.storage.local.get(ModelConfigStorageKey)
  return obj[ModelConfigStorageKey] as ModelConfig | undefined
}
export const setModelConfig = async (config: ModelConfig) => {
  await chrome.storage.local.set({ [ModelConfigStorageKey]: config })
}

export const getPromptConfig = async () => {
  const obj = await chrome.storage.local.get(PromptConfigStorageKey)
  return obj[PromptConfigStorageKey] as PromptConfig | undefined
}
export const setPromptConfig = async (config: PromptConfig) => {
  await chrome.storage.local.set({ [PromptConfigStorageKey]: config })
}

export async function getModelAndPromptConfig() {
  const obj = await chrome.storage.local.get([ModelConfigStorageKey, PromptConfigStorageKey])
  return {
    modelConfig: obj[ModelConfigStorageKey] as ModelConfig | undefined,
    promptConfig: obj[PromptConfigStorageKey] as PromptConfig | undefined,
  }
}

export function getSessionStorageKey(id: SessionID): SessionStorageKey {
  return `session_${id}`
}

// 清除所有会话
export const clearAllSessions = async () => {
  const obj = await chrome.storage.local.get(SessionMetaRefsKey)
  const refs = obj[SessionMetaRefsKey] as SessionMetaRefs
  if (refs) {
    const keys = refs.map((i) => getSessionStorageKey(i.id))
    await chrome.storage.local.remove(keys) // 移除会话
    await chrome.storage.local.remove(SessionMetaRefsKey) // 移除引用
  }
}

// 清除单个会话
export const deleteSession = async (id: SessionID) => {
  const obj = await chrome.storage.local.get(SessionMetaRefsKey)
  const refs = obj[SessionMetaRefsKey] as SessionMetaRefs
  if (refs) {
    await chrome.storage.local.remove(getSessionStorageKey(id)) // 移除会话
    const index = refs.findIndex((i) => i.id === id)
    if (index !== -1) {
      refs.splice(index, 1)
      await chrome.storage.local.set({ [SessionMetaRefsKey]: refs }) // 更新引用
    }
  }
}

export const captureSessionMessage = async (data: SessionData, role: MessageRole, count = 20) => {
  for (const i of data.messages) {
    if (i.role !== role) {
      continue
    }
    return i.content.substring(0, count)
  }
  return 'Untitled' // 没有找到用户消息，返回默认标题
}
export const buildSessionMeta = async (data: SessionData): Promise<SessionMeta> => {
  const now = Date.now()
  return {
    id: data.id,
    title: await captureSessionMessage(data, 'user'),
    preview: await captureSessionMessage(data, 'assistant', 50),
    type: data.type,
    createdAt: now,
    updatedAt: now,
  }
}

// 添加会话
export const appendSession = async (session: SessionData) => {
  const key = getSessionStorageKey(session.id)
  await chrome.storage.local.set({ [key]: session }) // 存储会话

  const obj = await chrome.storage.local.get(SessionMetaRefsKey)
  const refs = (obj[SessionMetaRefsKey] as SessionMetaRefs) || []
  if (refs) {
    const meta = await buildSessionMeta(session)
    refs.unshift(meta)
    await chrome.storage.local.set({ [SessionMetaRefsKey]: refs }) // 更新引用
  }
}

// 更新会话
export const updateSession = async (session: SessionData) => {
  const key = getSessionStorageKey(session.id)
  await chrome.storage.local.set({ [key]: session }) // 存储会话

  const obj = await chrome.storage.local.get(SessionMetaRefsKey)
  const refs = (obj[SessionMetaRefsKey] as SessionMetaRefs) || []
  if (refs) {
    const index = refs.findIndex((i) => i.id === session.id)
    if (index !== -1) {
      ;(refs[index] as SessionMeta).updatedAt = Date.now()
    } else {
      console.warn('session not found, fallback to append', session.id)
      const meta = await buildSessionMeta(session)
      refs.unshift(meta)
    }
    await chrome.storage.local.set({ [SessionMetaRefsKey]: refs }) // 更新引用
  }
}

// 获取会话
export const getSession = async (id: SessionID) => {
  const key = getSessionStorageKey(id)
  const obj = await chrome.storage.local.get(key)
  return obj[key] as SessionData | undefined
}

export const getSessionMetas = async () => {
  const obj = await chrome.storage.local.get(SessionMetaRefsKey)
  return obj[SessionMetaRefsKey] as SessionMetaRefs | undefined
}
