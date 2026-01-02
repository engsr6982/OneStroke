import ContentApp from './ContentApp.ce.vue'
import type { AppMessage } from '../types/message'
import { createVueApp } from '@/helper'
import elementPlusCss from 'element-plus/dist/index.css?inline'

const log = (msg: string, ...args: unknown[]) =>
  console.log(`%c[OneStroke Content] ${msg}`, 'color: #409eff; font-weight: bold;', ...args)

const containerId = 'onestroke-container-root'
let appInstance: InstanceType<typeof ContentApp> | null = null
let lastMouseX = 0
let lastMouseY = 0

document.addEventListener(
  'mouseup',
  (e) => {
    lastMouseX = e.clientX
    lastMouseY = e.clientY
  },
  true,
)

function initUI() {
  if (document.getElementById(containerId)) return

  log('Initializing UI...')
  const container = document.createElement('div')
  container.id = containerId
  document.body.appendChild(container)

  const shadowRoot = container.attachShadow({ mode: 'open' })

  const appStyles = (ContentApp.styles || []).join('')
  const styleSheet = document.createElement('style')
  styleSheet.textContent = elementPlusCss + appStyles
  shadowRoot.appendChild(styleSheet)

  // 创建 vue 挂载点
  const mountPoint = document.createElement('div')
  shadowRoot.appendChild(mountPoint)

  appInstance = createVueApp(ContentApp, mountPoint, false) as InstanceType<typeof ContentApp>

  log('UI Initialized')
}

chrome.runtime.onMessage.addListener((message: AppMessage, sender, sendResponse) => {
  try {
    if (message.action === 'PING') {
      sendResponse('PONG')
      return false
    }
    if (message.action === 'GET_SELECTION') {
      const selection = window.getSelection()?.toString() ?? ''
      sendResponse({ text: selection })
      return false
    }

    if (message.action === 'OPEN_WINDOW') {
      initUI()
      const selection = window.getSelection()
      let x = lastMouseX
      let y = lastMouseY

      // 尝试跟随选区，如果失败则跟随鼠标
      if (selection && selection.rangeCount > 0) {
        try {
          const rect = selection.getRangeAt(0).getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            x = rect.left
            y = rect.bottom + 10
          }
        } catch (e) {
          console.error('[OneStroke Content] Failed to get selection rect:', e)
        }
      }

      log('Opening window at', x, y)
      appInstance?.open(message.windowType, x, y)
    } else if (message.action === 'STREAM_CHUNK') {
      appInstance?.appendChunk(message.content)
    } else if (message.action === 'STREAM_END') {
      appInstance?.finish()
    } else if (message.action === 'ERROR') {
      appInstance?.appendChunk(`\n[System Error]: ${message.message}`)
    }

    sendResponse({ status: 'ok' })
  } catch (e) {
    console.error('[OneStroke Content] Message Handler Error:', e)
  }

  return false
})

log('Script Loaded & Ready')
