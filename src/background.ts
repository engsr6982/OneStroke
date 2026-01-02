import OpenAI from 'openai'
import { type PromptKeys, type SessionData } from './types/storage'
import type { AppMessage } from './types/message'
import { DEFAULT_CONFIG, DEFAULT_PROMPTS } from './types/constant'
import { appendSession, getModelAndPromptConfig } from './helper'

async function sendMessageToTab(tabId: number, message: AppMessage) {
  try {
    await chrome.tabs.sendMessage(tabId, message)
    console.log(`Message sent to tab ${tabId}: ${message.action}`)
    return true
  } catch (err) {
    console.error(`Failed to send ${message.action} to tab ${tabId}`, err)
    if (message.action === 'OPEN_WINDOW') {
      console.warn('💡 提示: 请刷新目标网页，确保 Content Script 已注入。')
    }
    return false
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Installed/Updated')
  chrome.contextMenus.create({
    id: 'onestroke_root',
    title: 'OneStroke 划词助手',
    contexts: ['selection'],
  })
  chrome.contextMenus.create({
    parentId: 'onestroke_root',
    id: 'summarize',
    title: '📝 划词总结',
    contexts: ['selection'],
  })
  chrome.contextMenus.create({
    parentId: 'onestroke_root',
    id: 'note',
    title: '📒 划词笔记',
    contexts: ['selection'],
  })
  chrome.contextMenus.create({
    parentId: 'onestroke_root',
    id: 'explain',
    title: '💡 划词解析',
    contexts: ['selection'],
  })
  chrome.contextMenus.create({
    parentId: 'onestroke_root',
    id: 'separator',
    type: 'separator',
    contexts: ['selection'],
  })
  chrome.contextMenus.create({
    parentId: 'onestroke_root',
    id: 'open_sidepanel',
    title: '📂 历史记录',
    contexts: ['selection', 'page'],
  })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return

  // 侧边栏
  if (info.menuItemId === 'open_sidepanel') {
    await chrome.sidePanel.open({ windowId: tab.windowId })
    return
  }

  if (!info.selectionText) return
  const type = info.menuItemId as PromptKeys

  console.log(`Menu clicked: ${type}`)

  const result = await sendMessageToTab(tab.id, {
    action: 'OPEN_WINDOW',
    windowType: type,
  })
  if (result) {
    await handleAiRequest(tab.id, type, info.selectionText)
  }
})

async function handleAiRequest(tabId: number, type: PromptKeys, text: string) {
  try {
    const settings = await getModelAndPromptConfig()
    const config = settings.modelConfig || DEFAULT_CONFIG
    const prompts = settings.promptConfig || DEFAULT_PROMPTS

    if (!config.apiKey) {
      await sendMessageToTab(tabId, { action: 'STREAM_CHUNK', content: '❌ 请先配置 API Key' })
      await sendMessageToTab(tabId, { action: 'STREAM_END' })
      return
    }

    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      dangerouslyAllowBrowser: true,
    })

    const stream = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: prompts[type] },
        { role: 'user', content: text },
      ],
      stream: true,
      temperature: 0.7,
      stream_options: {
        include_usage: true,
      },
    })

    console.log('AI Stream started')

    let fullResult = ''
    let totalToken = 0

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        fullResult += content
        await sendMessageToTab(tabId, { action: 'STREAM_CHUNK', content })
      }
      const totalt = chunk.usage?.total_tokens || 0
      if (totalt) {
        totalToken = totalt
      }
    }

    console.log('AI Stream finished')
    await sendMessageToTab(tabId, { action: 'STREAM_END' })

    if (fullResult.trim()) {
      const data: SessionData = {
        id: crypto.randomUUID(),
        type: type,
        totalToken: totalToken,
        messages: [
          {
            role: 'system',
            content: prompts[type],
          },
          {
            role: 'user',
            content: text,
          },
          {
            role: 'assistant',
            content: fullResult,
          },
        ],
      }
      await appendSession(data)
    }
  } catch (error) {
    console.error('AI Request Error', error)
    await sendMessageToTab(tabId, {
      action: 'STREAM_CHUNK',
      content: `\n\n❌ Error: ${error}`,
    })
    await sendMessageToTab(tabId, { action: 'STREAM_END' })
  }
}
