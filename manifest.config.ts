import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: 'OneStroke',
  version: pkg.version,
  description: 'AI 划词总结 / AI 划词笔记 / AI 划词解析',

  permissions: ['storage', 'contextMenus', 'activeTab', 'sidePanel', 'unlimitedStorage'],

  host_permissions: [
    'https://*.openai.com/*',
    'https://*.aliyuncs.com/*',
    'https://*.deepseek.com/*',
  ],

  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },

  action: {
    default_popup: 'src/popup/index.html',
  },

  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },

  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/content.ts'],
      run_at: 'document_idle',
    },
  ],
})
