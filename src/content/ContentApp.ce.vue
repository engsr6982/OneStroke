<template>
  <div v-if="visible" ref="windowRef" class="onestroke-float-window" :style="positionStyle">
    <div class="os-header" @mousedown="handleMouseDown">
      <span class="os-title">OneStroke - {{ title }}</span>
      <span class="os-close" @click="close">×</span>
    </div>

    <div class="os-body">
      <div v-if="loading && !result" class="os-loading">思考中...</div>
      <!-- 使用 pre-wrap 保留 AI 返回的格式 -->
      <div class="os-content" v-html="formattedResult"></div>
      <div v-if="loading && result" class="os-cursor"></div>
    </div>

    <div class="os-footer">
      <button @click="copyResult">复制</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getTagRenderName } from '@/helper'
import type { PromptKeys } from '@/types/storage'
import { ref, computed, onBeforeUnmount } from 'vue'

const visible = ref(false)
const loading = ref(false)
const result = ref('')
const currentType = ref<PromptKeys | null>(null)
const windowRef = ref<HTMLElement | null>(null)

const title = computed(() => {
  return getTagRenderName(currentType?.value as PromptKeys)
})

// TODO: 改进 Markdown 渲染
const formattedResult = computed(() => {
  return result.value.replace(/\n/g, '<br>')
})

// 窗口位置
const x = ref(0)
const y = ref(0)
const positionStyle = computed(() => ({
  top: `${y.value}px`,
  left: `${x.value}px`,
}))

let dragging = false
function handleMouseDown() {
  dragging = true
  setupListener()
}
function handleMouseUp() {
  dragging = false
  removeListener()
}
function setupListener() {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('blur', handleMouseUp)
}
function removeListener() {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('blur', handleMouseUp)
}
function handleMouseMove(event: MouseEvent) {
  if (!dragging) return
  if (!windowRef.value) return

  event.preventDefault() // 阻止默认行为，防止拖动时选中文字

  const rect = windowRef.value.getBoundingClientRect()
  const headerHeight = 48 // os-header 高度，允许除 header 外的区域溢出视口

  const nextX = x.value + event.movementX
  const nextY = y.value + event.movementY

  const maxX = window.innerWidth - rect.width
  const maxY = window.innerHeight - headerHeight

  x.value = Math.min(Math.max(0, nextX), maxX)
  y.value = Math.min(Math.max(0, nextY), maxY)
}
onBeforeUnmount(() => removeListener())

const open = (type: PromptKeys, clientX: number, clientY: number) => {
  currentType.value = type
  result.value = ''
  loading.value = true
  visible.value = true
  x.value = clientX
  y.value = clientY
}

const appendChunk = (chunk: string) => {
  result.value += chunk
}

const finish = () => {
  loading.value = false
}

const close = () => {
  visible.value = false
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(result.value)
  } catch (err) {
    console.error('Copy failed', err)
  }
}

// 对外暴露方法
defineExpose({ open, appendChunk, finish })
</script>

<style scoped>
.onestroke-float-window {
  position: fixed;
  /* Max Z-Index */
  z-index: 2147483647;
  width: 320px;
  max-height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.os-header {
  padding: 10px 15px;
  border-bottom: 1px solid #ebeef5;
  background: #f5f7fa;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  cursor: move;
}

.os-close {
  cursor: pointer;
  font-size: 18px;
  color: #909399;
}

.os-close:hover {
  color: #f56c6c;
}

.os-body {
  padding: 15px;
  overflow-y: auto;
  flex: 1;

  /* 禁止滚动链传播到父窗体 */
  overscroll-behavior: contain;
}

.os-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.os-loading {
  color: #909399;
  font-style: italic;
}

.os-cursor {
  display: inline-block;
  width: 2px;
  height: 14px;
  background: #333;
  animation: blink 1s infinite;
  vertical-align: middle;
}

.os-footer {
  padding: 8px 15px;
  border-top: 1px solid #ebeef5;
  text-align: right;
}

.os-footer button {
  background: #409eff;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.os-footer button:hover {
  background: #66b1ff;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}
</style>
