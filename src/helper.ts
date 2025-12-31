/* 辅助工具 */
import { createApp, type Component } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { type PromptTag } from './types/storage'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export function appendCssLinkTo(h5: HTMLElement | ShadowRoot, url: `${string}.css`) {
  const cssLink = document.createElement('link')
  cssLink.rel = 'stylesheet'
  cssLink.href = chrome.runtime.getURL(url)
  h5.appendChild(cssLink)
}

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

export const TAGS = ['summarize', 'note', 'explain'] as const as PromptTag[]
const TAG_CONFIG = {
  summarize: { type: 'primary', name: '总结' },
  note: { type: 'warning', name: '笔记' },
  explain: { type: 'success', name: '解析' },
} satisfies Record<PromptTag, { type: string; name: string }>

export const getTagType = (tag: PromptTag) => TAG_CONFIG[tag].type
export const getTagName = (tag: PromptTag) => TAG_CONFIG[tag].name

export const formatDate = (ts: number) => {
  return new Date(ts).toLocaleString('zh-CN', {
    hour12: false,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
