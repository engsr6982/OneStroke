import { getSession } from '@/helper'
import type { SessionData, SessionID } from '@/types/storage'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const sessionId = ref<SessionID | null>(null)
  const sessionData = ref<SessionData | null>(null)
  const isStreaming = ref(false)

  async function switchSession(id: SessionID) {
    if (sessionId.value === id) return
    if (isStreaming.value) return

    sessionId.value = id
    sessionData.value = null

    const data = await getSession(id)
    if (data) {
      sessionData.value = data
    }
  }

  function clearSession() {
    sessionId.value = null
    sessionData.value = null
  }

  return {
    sessionId,
    sessionData,
    isStreaming,
    switchSession,
    clearSession,
  }
})
