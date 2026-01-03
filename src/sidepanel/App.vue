<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Delete, CirclePlus, Lightning } from '@element-plus/icons-vue'
import ChatView from './view/ChatView.vue'
import HistoryView from './view/HistoryView.vue'
import { clearAllSessions, deleteSession, getTagRenderName, SessionTypes } from '@/helper'
import { ElMessage, ElMessageBox } from 'element-plus'
import DetailDrawer from './components/DetailDrawer.vue'
import type { SessionMeta } from '@/types/storage'
import { useChatStore } from './stores/chat'

type Tab = 'history' | 'chat'
const activeTab = ref<Tab>('history')
const detailDrawer = ref<InstanceType<typeof DetailDrawer>>()
const detailDrawerMeta = ref<SessionMeta | null>(null)

const chatStore = useChatStore()

const historyProps = reactive({
  serachKeyword: '',
  filterTag: null,
})

const currentTokenUsage = computed(() => `${chatStore.sessionData?.totalToken ?? 0} tokens`)
const isChatDeleteBtnDisabled = computed(() => {
  return chatStore.isStreaming || chatStore.sessionId === null
})

const handleClearHistory = async () => {
  try {
    await ElMessageBox.confirm('确定清空所有历史记录吗？', '提示', { type: 'warning' })
    await clearAllSessions()
    ElMessage.success('清空成功')
  } catch (e) {
    void e // ignore
  }
}

const handleSelectHistory = (meta: SessionMeta) => {
  console.debug('handleSelectHistory', meta)
  if (meta.type === 'chat') {
    activeTab.value = 'chat'
    if (chatStore.sessionId === meta.id) {
      return
    }
    if (chatStore.isStreaming) {
      ElMessage.error('当前对话中存在未完成的任务')
      return
    }
    chatStore.switchSession(meta.id)
    return
  }
  detailDrawerMeta.value = meta
  detailDrawer.value?.show()
}

const handleDeleteChat = async () => {
  try {
    if (chatStore.isStreaming) {
      ElMessage.error('当前对话中存在未完成的任务')
      return
    }
    if (chatStore.sessionId === null) {
      return
    }
    await ElMessageBox.confirm('确定删除该对话吗？', '提示', { type: 'warning' })
    deleteSession(chatStore.sessionId)
    chatStore.clearSession()
    ElMessage.success('删除成功')
  } catch (e) {
    void e // ignore
  }
}
const handleNewSession = () => {
  if (chatStore.isStreaming) {
    ElMessage.error('当前对话中存在未完成的任务')
    return
  }
  chatStore.clearSession()
}
</script>

<template>
  <div class="sidepanel-container">
    <!-- 顶部导航栏 -->
    <div class="nav-header">
      <div class="nav-switch">
        <el-radio-group v-model="activeTab" size="small">
          <el-radio-button value="history">历史</el-radio-button>
          <el-radio-button value="chat">对话</el-radio-button>
        </el-radio-group>
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
              <el-option
                v-for="tag in SessionTypes"
                :key="tag"
                :label="getTagRenderName(tag)"
                :value="tag"
              />
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

            <el-tooltip content="新会话" placement="bottom">
              <el-button link :icon="CirclePlus" @click="handleNewSession" />
            </el-tooltip>

            <el-tooltip content="删除对话" placement="bottom-end">
              <el-button
                type="danger"
                link
                :icon="Delete"
                @click="handleDeleteChat"
                :disabled="isChatDeleteBtnDisabled"
              />
            </el-tooltip>
          </div>
        </Transition>
      </div>
    </div>

    <div class="content-area">
      <KeepAlive>
        <history-view
          v-if="activeTab === 'history'"
          v-bind="historyProps"
          @selectHistory="handleSelectHistory"
        />
        <chat-view v-else />
      </KeepAlive>
    </div>

    <detail-drawer ref="detailDrawer" :meta="detailDrawerMeta" />
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
  align-items: center;
  height: 100%;
  display: inline-flex;
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
