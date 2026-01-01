<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Clock, Comment, Delete, Download, Brush, Lightning } from '@element-plus/icons-vue'
import ChatView from './view/ChatView.vue'
import HistoryView from './view/HistoryView.vue'
import { getTagName, TAGS } from '@/helper'

type Tab = 'history' | 'chat'
const activeTab = ref<Tab>('history')
const historyProps = reactive({
  serachKeyword: '',
  filterTag: null,
})
const chatModel = reactive({
  tokenUsage: '0',
})

const currentView = computed(() => {
  return activeTab.value === 'history' ? HistoryView : ChatView
})
const currentViewProps = computed(() => {
  return activeTab.value === 'history' ? historyProps : {}
})
const currentTokenUsage = computed(() => `${chatModel.tokenUsage}k`)

const handleClearHistory = () => {
  // TODO: 清理历史记录
}
const handleExportChat = () => {
  // TODO: 导出对话
}
const handleClearContext = () => {
  // TODO: 清理上下文
}
</script>

<template>
  <div class="sidepanel-container">
    <!-- 顶部导航栏 -->
    <div class="nav-header">
      <div class="nav-switch">
        <el-segmented
          v-model="activeTab"
          :options="[
            { label: '历史', value: 'history', icon: Clock },
            { label: '对话', value: 'chat', icon: Comment },
          ]"
          size="small"
        >
          <template #default="{ item }">
            <div class="segment-item">
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </div>
          </template>
        </el-segmented>
      </div>

      <!-- 工具栏 -->
      <div class="nav-view-tool">
        <Transition name="fade-slide" mode="out-in">
          <!-- 历史 -->
          <div v-if="activeTab === 'history'" key="history" class="tool-group">
            <!-- 搜索 -->
            <el-input
              v-model="historyProps.serachKeyword"
              placeholder="搜索..."
              prefix-icon="Search"
              class="history-search"
              size="small"
              clearable
            />

            <!-- Tag 过滤 -->
            <el-select
              v-model="historyProps.filterTag"
              placeholder="类型"
              size="small"
              style="min-width: 60px; max-width: 60px"
              clearable
            >
              <el-option v-for="tag in TAGS" :key="tag" :label="getTagName(tag)" :value="tag" />
            </el-select>

            <!-- 清理 -->
            <el-tooltip content="清空所有历史" placement="bottom-end">
              <el-button type="danger" link :icon="Delete" @click="handleClearHistory" />
            </el-tooltip>
          </div>

          <!-- 对话 -->
          <div v-else key="chat" class="tool-group">
            <!-- Token 徽章 -->
            <el-tooltip content="当前对话的 Token 使用量" placement="bottom">
              <div class="token-badge">
                <el-icon><Lightning /></el-icon> {{ currentTokenUsage }}
              </div>
            </el-tooltip>

            <el-divider direction="vertical" />

            <el-tooltip content="清屏/新会话" placement="bottom">
              <el-button link :icon="Brush" @click="handleClearContext" />
            </el-tooltip>

            <el-tooltip content="导出 Markdown" placement="bottom-end">
              <el-button link :icon="Download" @click="handleExportChat" />
            </el-tooltip>
          </div>
        </Transition>
      </div>
    </div>

    <div class="content-area">
      <KeepAlive>
        <component :is="currentView" v-bind="currentViewProps" />
      </KeepAlive>
    </div>
  </div>
</template>

<style scoped>
.sidepanel-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 占满侧边栏高度 */
  background-color: var(--el-bg-color);
}

.nav-header {
  height: 44px;
  padding: 0 10px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between; /* 左右撑开 */
  background-color: #fff;
  overflow: hidden; /* 防止动画溢出 */
  gap: 10px;
}

/* 切换视图 */
.nav-switch {
  flex-shrink: 0;
}
.segment-item {
  display: flex;
  align-items: center;
  gap: 4px; /* icon 和文本之间的间距 */
}

/* 右侧工具栏 */
.nav-view-tool {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.tool-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
  height: 100%;
}

/* 历史搜索框 */
.history-search {
  width: 100%;
}

/* Token 徽章样式 */
.token-badge {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 2px;
}

/* --- 切换动画 (Vue Transition) --- */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px); /* 从下方浮现 */
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px); /* 向上方消失 */
}

.content-area {
  flex: 1;
  overflow: hidden; /* 内部出现滚动条，整体不滚动 */
  position: relative;
}
</style>
