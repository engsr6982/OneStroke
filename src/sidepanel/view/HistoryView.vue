<template>
  <div class="sidepanel-container">
    <!-- 列表区域 -->
    <div class="list-container">
      <el-empty v-if="filteredList.length === 0" description="暂无记录" :image-size="80" />
      <el-scrollbar v-else>
        <div
          v-for="item in filteredList"
          :key="item.id"
          class="history-item"
          @click="showDetail(item)"
        >
          <div class="item-header">
            <el-tag size="small" :type="getTagType(item.type)" effect="dark">{{
              getTagName(item.type)
            }}</el-tag>
            <span class="item-time">{{ formatDate(item.timestamp) }}</span>
          </div>
          <div class="item-text">{{ item.originalText }}</div>
          <div class="item-preview">{{ item.result.slice(0, 50) }}...</div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="记录详情"
      direction="btt"
      size="85%"
      :with-header="false"
      destroy-on-close
      body-class="no-padding-drawer-body"
    >
      <div v-if="currentItem" class="drawer-layout">
        <!-- 工具 -->
        <div class="drawer-header">
          <div class="header-left">
            <span class="title">{{ getTagName(currentItem.type) }}结果</span>
            <el-radio-group v-model="activeDetailTab" size="small">
              <el-radio-button label="result">AI 结果</el-radio-button>
              <el-radio-button label="original">原文</el-radio-button>
            </el-radio-group>
          </div>

          <div class="header-right">
            <el-button-group size="small">
              <el-button
                type="primary"
                plain
                icon="CopyDocument"
                @click="copyText(currentItem.result)"
              />
              <el-button type="danger" plain icon="Delete" @click="deleteItem(currentItem.id)" />
            </el-button-group>
            <el-button
              size="small"
              icon="Close"
              circle
              @click="drawerVisible = false"
              style="margin-left: 8px"
            />
          </div>
        </div>

        <!-- 内容 -->
        <div class="drawer-content">
          <!-- 结果页 -->
          <div v-show="activeDetailTab === 'result'" class="scroll-wrapper">
            <div class="text-content result-text">
              <pre>{{ currentItem.result }}</pre>
            </div>
          </div>

          <!-- 原文页 -->
          <div v-show="activeDetailTab === 'original'" class="scroll-wrapper">
            <div class="text-content original-text">
              {{ currentItem.originalText }}
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { HistoryItem, PromptTag } from '../../types/storage'
import { formatDate, getTagName, getTagType } from '@/helper'

const props = defineProps<{
  serachKeyword: string
  filterTag: PromptTag | null
}>()

const historyList = ref<HistoryItem[]>([])
const drawerVisible = ref(false)
const currentItem = ref<HistoryItem | null>(null)
const activeDetailTab = ref('result')

const filteredList = computed(() => {
  return historyList.value.filter((item) => {
    const text = props.serachKeyword.toLowerCase()
    const matchText =
      (item.originalText || '').toLowerCase().includes(text) ||
      (item.result || '').toLowerCase().includes(text)

    const matchType = props.filterTag ? item.type === props.filterTag : true
    return matchText && matchType
  })
})

const loadHistory = async () => {
  const data = await chrome.storage.local.get('history')
  if (data.history) {
    historyList.value = data.history.sort(
      (a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp,
    )
  }
}

const handleStorageChange = (
  changes: { [name: string]: chrome.storage.StorageChange },
  areaName: string,
) => {
  if (areaName === 'local' && changes.history) {
    historyList.value = changes.history.newValue || []
  }
}

onMounted(() => {
  loadHistory()
  chrome.storage.onChanged.addListener(handleStorageChange)
})

onUnmounted(() => {
  chrome.storage.onChanged.removeListener(handleStorageChange)
})

const showDetail = (item: HistoryItem) => {
  currentItem.value = item
  activeDetailTab.value = 'result'
  drawerVisible.value = true
}

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch (e) {
    console.error(e)
    ElMessage.error('复制失败')
  }
}

const deleteItem = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', { type: 'warning' })
    const newHistory = historyList.value.filter((item) => item.id !== id)
    await chrome.storage.local.set({ history: newHistory })
    drawerVisible.value = false
    ElMessage.success('已删除')
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.sidepanel-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;
}

.toolbar {
  padding: 10px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.list-container {
  flex: 1;
  overflow: hidden; /* 让内部的 el-scrollbar 处理滚动 */
}

.drawer-layout {
  display: flex;
  flex-direction: column;
  height: 100%; /* 占满 drawer body 的 100% */
  overflow: hidden;
}

.drawer-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0; /* 防止被压缩 */
  background: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.drawer-content {
  flex: 1; /* 占据剩余所有空间 */
  min-height: 0;
  position: relative;
  background-color: #f8f9fa;
}

.scroll-wrapper {
  height: 100%;
  overflow-y: auto; /* 原生滚动 */
  padding: 16px;
  box-sizing: border-box;
}

/* 文本内容样式 */
.text-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
}

.original-text {
  color: #606266;
  font-style: italic;
}

.result-text pre {
  margin: 0;
  font-family: inherit;
  white-space: pre-wrap;
}

.history-item {
  padding: 12px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: background 0.2s;
}
.history-item:hover {
  background-color: #f5f7fa;
}
.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.item-time {
  font-size: 12px;
  color: #909399;
}
.item-text {
  font-size: 13px;
  color: #303133;
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.item-preview {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<style>
/* 移除 element-plus 的 padding */
.no-padding-drawer-body .el-drawer__body {
  padding: 0 !important;
}
</style>
