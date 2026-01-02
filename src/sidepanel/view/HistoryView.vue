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
            <div class="item-header-lf-group">
              <el-tag size="small" :type="getTagRenderType(item.type)" effect="dark">{{
                getTagRenderName(item.type)
              }}</el-tag>
              <div class="item-header-lf-title">{{ item.title }}</div>
            </div>
            <span class="item-header-rh-time">{{ formatDate(item.updatedAt) }}</span>
          </div>
          <div class="item-preview">{{ item.preview }}...</div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 详情抽屉 -->
    <DetailDrawer ref="drawer" :meta="showMeta" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { PromptKeys, SessionMeta, SessionMetas } from '../../types/storage'
import {
  formatDate,
  getSessionMetas,
  getTagRenderName,
  getTagRenderType,
  SessionMetaRefsKey,
} from '@/helper'
import DetailDrawer from './components/DetailDrawer.vue'

const props = defineProps<{
  serachKeyword: string
  filterTag?: PromptKeys | null
}>()

const sessionMetas = ref<SessionMetas>([])

const drawer = ref<InstanceType<typeof DetailDrawer>>()
const showMeta = ref<SessionMeta | null>(null)

const filteredList = computed(() => {
  return sessionMetas.value.filter((item) => {
    const text = props.serachKeyword.toLowerCase()
    const matchText = (item.title || '').toLowerCase().includes(text)
    const matchType = props.filterTag ? item.type === props.filterTag : true
    return matchText && matchType
  })
})

const loadSessionMetas = async () => {
  const data = await getSessionMetas()
  sessionMetas.value = data || []
}

const handleStorageChange = (
  changes: { [name: string]: chrome.storage.StorageChange },
  areaName: string,
) => {
  if (areaName === 'local' && changes[SessionMetaRefsKey]) {
    sessionMetas.value = changes[SessionMetaRefsKey].newValue || []
  }
}

onMounted(() => {
  loadSessionMetas()
  chrome.storage.onChanged.addListener(handleStorageChange)
})
onUnmounted(() => {
  chrome.storage.onChanged.removeListener(handleStorageChange)
})

const showDetail = (item: SessionMeta) => {
  if (item.type === 'chat') {
    // TODO: 跳转到聊天页面
    console.log('TODO: 跳转到聊天页面', item)
    return
  }
  showMeta.value = item
  drawer.value?.show()
}
</script>

<style scoped>
.sidepanel-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;
}

.list-container {
  flex: 1;
  overflow: hidden; /* 让内部的 el-scrollbar 处理滚动 */
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
  align-items: center;
  gap: 8px; /* 间距 8px */
}
.item-header-lf-group {
  display: flex;
  justify-content: flex-start; /* 左对齐 */
  gap: 5px; /* tag 和 title 间隔 */
  min-width: 0; /* 允许缩小 */
}
.item-header-lf-title {
  font-size: 14px;
  overflow: hidden; /* 溢出隐藏 */
  text-overflow: ellipsis; /* 溢出省略 */
  white-space: nowrap; /* 禁止换行 */
}
.item-header-rh-time {
  font-size: 12px;
  color: #909399;
  flex-shrink: 0; /* 禁止压缩 */
}
.item-preview {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
