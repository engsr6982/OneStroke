<script setup lang="ts">
import { deleteSession, getSession, getTagRenderName } from '@/helper'
import type { SessionData, SessionID, SessionMeta } from '@/types/storage'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, watch } from 'vue'

export interface DetailDrawerProps {
  meta: SessionMeta | null
}

const visible = ref(false)
const sessionData = ref<SessionData | null>(null)
const tab = ref<'original' | 'result'>('result')
const props = defineProps<DetailDrawerProps>()

const show = async () => {
  visible.value = true
  tab.value = 'result'
}
const hide = () => {
  visible.value = false
}
defineExpose({ show, hide }) // 对外接口

const reset = () => {
  visible.value = false
  sessionData.value = null
}

watch(
  () => props.meta,
  async (newMeta) => {
    if (!newMeta) {
      reset()
      return
    }
    if (newMeta.type === 'chat') {
      console.error('Unsupported data type')
      reset()
      return
    }

    const data = await getSession(newMeta.id)
    if (!data) {
      console.warn(`Session ${newMeta.id} not found`)
      reset()
      return
    }
    if (data.messages.length != 3) {
      console.warn(`Unsupported data type`)
      reset()
      return
    }
    sessionData.value = data as SessionData
  },
  { immediate: true }, // 组件初始化时如果 meta 不为空，也会触发
)

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch (e) {
    console.error(e)
    ElMessage.error('复制失败')
  }
}

const deleteItem = async (id: SessionID) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', { type: 'warning' })
    deleteSession(id)
    visible.value = false
    ElMessage.success('已删除')
  } catch (e) {
    void e // ignore
  }
}
</script>

<template>
  <el-drawer
    v-model="visible"
    title="记录详情"
    direction="btt"
    size="85%"
    :with-header="false"
    destroy-on-close
    body-class="no-padding-drawer-body"
  >
    <div v-if="sessionData" class="drawer-layout">
      <!-- 工具 -->
      <div class="drawer-header">
        <div class="header-left">
          <span class="title">{{ getTagRenderName(sessionData.type) }}结果</span>
          <el-radio-group v-model="tab" size="small">
            <el-radio-button value="result">AI 结果</el-radio-button>
            <el-radio-button value="original">原文</el-radio-button>
          </el-radio-group>
        </div>

        <div class="header-right">
          <el-button-group size="small">
            <el-button type="primary" plain icon="CopyDocument" @click="copyText" />
            <el-button type="danger" plain icon="Delete" @click="deleteItem(sessionData.id)" />
          </el-button-group>
          <el-button
            size="small"
            icon="Close"
            circle
            @click="visible = false"
            style="margin-left: 8px"
          />
        </div>
      </div>

      <!-- 内容 -->
      <div class="drawer-content">
        <template v-for="(msg, idx) in sessionData.messages" :key="idx">
          <!-- 结果页 -->
          <div v-if="msg.role === 'assistant'" v-show="tab === 'result'" class="scroll-wrapper">
            <div class="text-content result-text">
              <pre>{{ msg.content }}</pre>
            </div>
          </div>

          <!-- 原文页 -->
          <div v-else-if="msg.role === 'user'" v-show="tab === 'original'" class="scroll-wrapper">
            <div class="text-content original-text">
              {{ msg.content }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
.drawer-layout {
  display: flex;
  flex-direction: column;
  height: 100%; /* 占满 drawer body 的 100% */
  overflow: hidden;
}

.drawer-header {
  padding: 12px 0;
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
</style>

<style>
/* 移除 element-plus 的 padding */
.no-padding-drawer-body .el-drawer__body {
  padding: 0 !important;
}
</style>
