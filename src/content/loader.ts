/* Content Script Loader 用于解决 Content Script 工作在非 Module 环境导致的 import 语法报错 */

;(async () => {
  try {
    const src = chrome.runtime.getURL('content.js')
    await import(src)
  } catch (e) {
    console.error('OneStroke Content Script Load Error:', e)
  }
})()
