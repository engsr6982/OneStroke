<template>
  <div class="popup-container">
    <div class="header">
      <!-- TODO: fix icon -->
      <!-- <img src="/icons/icon128.png" alt="Logo" class="logo" /> -->
      <h2>OneStroke 设置</h2>
    </div>

    <el-tabs v-model="activeTab" class="tabs">
      <!-- 1. 模型配置 -->
      <el-tab-pane label="模型配置" name="model">
        <el-form :model="config" label-position="top" size="small">
          <el-form-item label="AI 提供商(内置模板)">
            <el-text class="mx-1" type="danger">仅支持兼容 OpenAI SDK 的模型</el-text>
            <el-select
              v-model="config.provider"
              placeholder="选择提供商"
              @change="handleProviderChange"
            >
              <!-- 动态生成选择项 -->
              <template v-for="(provider, key) in AiProviderTemplate" :key="key">
                <el-option :label="provider.label" :value="key" />
              </template>
            </el-select>
          </el-form-item>

          <el-form-item label="API Key">
            <el-input v-model="config.apiKey" type="password" show-password placeholder="sk-..." />
          </el-form-item>

          <el-form-item label="接口地址 (Base URL)">
            <el-input v-model="config.baseUrl" placeholder="https://api.openai.com/v1" />
          </el-form-item>

          <el-form-item label="模型名称">
            <el-input v-model="config.model" placeholder="gpt-4o" />
          </el-form-item>

          <el-button type="primary" class="w-full" @click="saveSettings" :loading="saving"
            >保存配置</el-button
          >
        </el-form>
      </el-tab-pane>

      <!-- 2. Prompt 配置 -->
      <el-tab-pane label="Prompt 设置" name="prompt">
        <el-form :model="prompts" label-position="top" size="small">
          <el-form-item label="划词总结 Prompt">
            <el-input v-model="prompts.summarize" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item label="划词笔记 Prompt">
            <el-input v-model="prompts.note" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item label="划词解析 Prompt">
            <el-input v-model="prompts.explain" type="textarea" :rows="3" />
          </el-form-item>

          <div class="btn-group">
            <el-button @click="resetPrompts">恢复默认</el-button>
            <el-button type="primary" @click="saveSettings" :loading="saving"
              >保存 Prompt</el-button
            >
          </div>
        </el-form>
      </el-tab-pane>

      <!-- 3. 历史记录 -->
      <el-tab-pane label="历史记录" name="history">
        <div v-if="historyList.length === 0" class="empty-state">
          <el-empty description="暂无历史记录" :image-size="60" />
        </div>

        <div v-else class="history-list">
          <div class="history-actions">
            <el-button type="danger" link size="small" @click="clearHistory">清空历史</el-button>
          </div>

          <el-scrollbar>
            <el-card v-for="item in historyList" :key="item.id" shadow="hover" class="history-card">
              <template #header>
                <div class="card-header">
                  <el-tag size="small" :type="getTagType(item.type)">{{
                    getTagName(item.type)
                  }}</el-tag>
                  <span class="time">{{ formatDate(item.timestamp) }}</span>
                </div>
              </template>
              <div class="card-content">
                <p class="original text-truncate">{{ item.originalText }}</p>
                <el-divider style="margin: 8px 0" />
                <p class="result text-truncate">{{ item.result }}</p>
              </div>
            </el-card>
          </el-scrollbar>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { AiProviderTemplate, DEFAULT_CONFIG, DEFAULT_PROMPTS } from '../types/storage'
import type { AiConfig, PromptConfig, HistoryItem } from '../types/storage'
import { formatDate, getTagName, getTagType } from '@/helper'

const activeTab = ref('model')
const saving = ref(false)
const config = reactive<AiConfig>({ ...DEFAULT_CONFIG })
const prompts = reactive<PromptConfig>({ ...DEFAULT_PROMPTS })
const historyList = ref<HistoryItem[]>([])

const loadHistory = async () => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    const data = await chrome.storage.local.get('history')
    if (data.history) {
      // 按时间倒序
      historyList.value = data.history.sort(
        (a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp,
      )
    }
  }
}

const handleStorageChange = (
  changes: { [key: string]: chrome.storage.StorageChange },
  areaName: string,
) => {
  if (areaName === 'local' && changes.history) {
    console.log('History updated externally')
    // 更新本地列表
    historyList.value = changes.history.newValue || []
  }
}

onMounted(async () => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    const settings = await chrome.storage.sync.get(['config', 'prompts'])
    if (settings.config) Object.assign(config, settings.config)
    if (settings.prompts) Object.assign(prompts, settings.prompts)

    await loadHistory()
    chrome.storage.onChanged.addListener(handleStorageChange)
  }
})
onUnmounted(() => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.onChanged.removeListener(handleStorageChange)
  }
})

const handleProviderChange = (val: string) => {
  const provider = AiProviderTemplate[val as keyof typeof AiProviderTemplate]
  config.baseUrl = provider.baseUrl
  config.model = provider.model
}

const saveSettings = async () => {
  saving.value = true
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.sync.set({
        config: { ...config },
        prompts: { ...prompts },
      })
      ElMessage.success('设置已保存')
    } else {
      console.log('Dev Mode Save:', config, prompts)
      ElMessage.warning('开发环境：配置已打印到控制台')
    }
  } catch (e) {
    ElMessage.error('保存失败')
    console.error(e)
  } finally {
    saving.value = false
  }
}

// 恢复默认 Prompt
const resetPrompts = () => {
  Object.assign(prompts, DEFAULT_PROMPTS)
}

// 清空历史
const clearHistory = async () => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    await chrome.storage.local.remove('history')
    ElMessage.success('历史记录已清空')
  }
}
</script>

<style scoped>
.popup-container {
  width: 360px;
  /* 扩展弹窗的标准宽度 */
  min-height: 500px;
  padding: 16px;
  background-color: #fff;
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑',
    Arial, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.logo {
  width: 24px;
  height: 24px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.w-full {
  width: 100%;
}

.btn-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.history-list {
  height: 400px;
}

/* 历史记录卡片样式 */
.history-actions {
  text-align: right;
  margin-bottom: 8px;
}

.history-card {
  margin-bottom: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time {
  font-size: 12px;
  color: #909399;
}

.card-content p {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #606266;
}

/* 文本截断 */
.text-truncate {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  padding: 20px 0;
}
</style>
