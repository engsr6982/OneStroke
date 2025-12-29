console.log('Background script loaded')

// Fired when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed or updated')
})

// Simple message listener example
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message in background:', message)
  if (message.greeting === 'hello') {
    sendResponse({ reply: 'Hi from background!' })
  }
  return true
})
