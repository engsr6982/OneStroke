<template>
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
            <el-icon class="edit-icon" @click.stop="openEditDialog(item)"> <Edit /> </el-icon>
          </div>
          <span class="item-header-rh-time">{{ formatDate(item.updatedAt) }}</span>
        </div>
        <div class="item-preview">{{ item.preview }}...</div>
        <div v-if="isDev">{{ item.id }}</div>
      </div>
    </el-scrollbar>

    <!-- 编辑标题 -->
    <el-dialog v-model="editDialogVisible" title="修改标题" width="400px" align-center>
      <el-input
        v-model="editingTitle"
        placeholder="请输入新标题"
        @keydown.enter="saveTitle"
        autofocus
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTitle">保存</el-button>
        </span>
      </template>
    </el-dialog>
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
import { Edit } from '@element-plus/icons-vue'

const props = defineProps<{
  serachKeyword: string
  filterTag?: PromptKeys | null
}>()

const emits = defineEmits<{
  selectHistory: [meta: SessionMeta]
}>()

const sessionMetas = ref<SessionMetas>([])

const isDev = computed(() => {
  return import.meta.env.DEV
})

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

const showDetail = (item: SessionMeta) => emits('selectHistory', item)

const editDialogVisible = ref(false)
const editingTitle = ref('')
const editingId = ref('')

const openEditDialog = (item: SessionMeta) => {
  editingId.value = item.id
  editingTitle.value = item.title || ''
  editDialogVisible.value = true
}

const saveTitle = async () => {
  if (!editingId.value) return
  const allMetas = await getSessionMetas()
  if (!allMetas) {
    return
  }
  const index = allMetas.findIndex((i) => i.id === editingId.value)
  if (index !== -1) {
    allMetas[index]!.title = editingTitle.value
    await chrome.storage.local.set({ [SessionMetaRefsKey]: allMetas })
  }
  editDialogVisible.value = false
}
</script>

<style scoped>
.list-container {
  flex: 1;
  overflow: hidden; /* 让内部的 el-scrollbar 处理滚动 */
  height: 100%;
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
  align-items: center; /* 确保图标垂直居中 */
}
/* 编辑图标样式 */
.edit-icon {
  font-size: 14px;
  color: #c0c4cc;
  cursor: pointer;
  flex-shrink: 0; /* 防止图标被挤压消失 */
  display: none; /* 默认隐藏，保持界面整洁 */
}
/* 鼠标悬停在该行时显示图标 */
.history-item:hover .edit-icon {
  display: inline-flex;
}
.edit-icon:hover {
  color: #409eff;
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
