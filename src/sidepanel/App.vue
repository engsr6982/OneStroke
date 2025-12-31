<template>
  <div class="sidepanel-container">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <el-input
        v-model="searchText"
        placeholder="搜索历史记录..."
        prefix-icon="Search"
        clearable
        size="small"
        class="search-input"
      />
      <el-select v-model="filterType" placeholder="类型" size="small" style="width: 80px" clearable>
        <!-- 生成选项 -->
        <template v-for="tag in TAGS" :key="tag">
          <el-option :label="getTagName(tag)" :value="tag" />
        </template>
      </el-select>
    </div>

    <!-- 列表区域 -->
    <div class="list-container">
      <el-empty v-if="filteredList.length === 0" description="暂无相关记录" />

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
          <div class="item-text original">{{ item.originalText }}</div>
          <div class="item-preview">{{ item.result.slice(0, 50) }}...</div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 详情抽屉 (使用 Drawer 展示详细信息) -->
    <el-drawer
      v-model="drawerVisible"
      title="记录详情"
      direction="btt"
      size="80%"
      :with-header="false"
      destroy-on-close
    >
      <div v-if="currentItem" class="detail-container">
        <div class="detail-header">
          <h3>{{ getTagName(currentItem.type) }}结果</h3>
          <div class="actions">
            <el-button type="primary" link icon="CopyDocument" @click="copyText(currentItem.result)"
              >复制结果</el-button
            >
            <el-button type="danger" link icon="Delete" @click="deleteItem(currentItem.id)"
              >删除</el-button
            >
          </div>
        </div>

        <el-tabs v-model="activeDetailTab">
          <el-tab-pane label="AI 结果" name="result">
            <div class="content-box result-box">
              <!-- TODO: 改进 markdown 渲染 -->
              <pre>{{ currentItem.result }}</pre>
            </div>
          </el-tab-pane>
          <el-tab-pane label="原文" name="original">
            <div class="content-box original-box">
              {{ currentItem.originalText }}
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="detail-footer">
          <el-button @click="drawerVisible = false" class="w-full">关闭</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { HistoryItem } from '../types/storage'
import { formatDate, getTagName, getTagType, TAGS } from '@/helper'

const historyList = ref<HistoryItem[]>([])
const searchText = ref('')
const filterType = ref('')
const drawerVisible = ref(false)
const currentItem = ref<HistoryItem | null>(null)
const activeDetailTab = ref('result')

const filteredList = computed(() => {
  return historyList.value.filter((item) => {
    const matchText =
      item.originalText.includes(searchText.value) || item.result.includes(searchText.value)
    const matchType = filterType.value ? item.type === filterType.value : true
    return matchText && matchType
  })
})

// 加载数据
const loadHistory = async () => {
  const data = await chrome.storage.local.get('history')
  if (data.history) {
    historyList.value = data.history.sort(
      (a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp,
    )
  }
}

// 监听数据变化
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
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.search-input {
  flex: 1;
}

.list-container {
  flex: 1;
  overflow: hidden;
  /* 交给 el-scrollbar */
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
  align-items: center;
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

  /* 文本截断 2行 */
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

/* 详情页样式 */
.detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.content-box {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  min-height: 200px;
  white-space: pre-wrap;
  /* 保持换行 */
}

.original-box {
  color: #606266;
  font-style: italic;
}

.detail-footer {
  margin-top: 5px;
}

.w-full {
  width: 100%;
}
</style>
