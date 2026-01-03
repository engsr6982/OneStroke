import App from './App.vue'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(ElementPlus, {
  locale: zhCn,
})
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')

import 'markstream-vue/index.css'
import 'katex/dist/katex.min.css'
import { enableKatex, enableMermaid } from 'markstream-vue'

enableMermaid()
enableKatex()
