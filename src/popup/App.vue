<template>
  <div class="popup-container">
    <div class="header">
      <!-- TODO: fix icon -->
      <!-- <img src="/icons/icon128.png" alt="Logo" class="logo" /> -->
      <h2>OneStroke 设置</h2>
      <el-button type="primary" size="small" icon="Fold" plain @click="showSidePanel"
        >侧边栏</el-button
      >
    </div>

    <el-tabs v-model="activeTab" class="tabs">
      <!-- 1. 模型配置 -->
      <el-tab-pane label="模型配置" name="model">
        <el-form :model="modelConfig" label-position="top" size="small">
          <el-form-item label="AI 提供商(内置模板)">
            <el-text v-if="isTipVisible" class="mx-1" type="danger"
              >注意: 仅支持兼容 OpenAI SDK 的模型</el-text
            >
            <el-select
              v-model="modelConfig.provider"
              placeholder="选择提供商"
              @change="handleProviderChange"
            >
              <!-- 动态生成选择项 -->
              <template v-for="(provider, key) in ModelProviderTemplate" :key="key">
                <el-option :label="provider.label" :value="key" />
              </template>
            </el-select>
          </el-form-item>

          <el-form-item label="API Key">
            <el-input
              v-model="modelConfig.apiKey"
              type="password"
              show-password
              placeholder="sk-..."
            />
          </el-form-item>

          <el-form-item label="接口地址 (Base URL)">
            <el-input v-model="modelConfig.baseUrl" placeholder="https://api.openai.com/v1" />
          </el-form-item>

          <el-form-item label="模型ID">
            <el-input v-model="modelConfig.model" placeholder="gpt-4o" />
          </el-form-item>

          <el-button type="primary" class="w-full" @click="saveSettings" :loading="saving"
            >保存配置</el-button
          >
        </el-form>
      </el-tab-pane>

      <!-- 2. Prompt 配置 -->
      <el-tab-pane label="Prompt 设置" name="prompt">
        <el-form :model="promptConfig" label-position="top" size="small">
          <el-form-item label="划词总结 Prompt">
            <el-input v-model="promptConfig.summarize" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item label="划词笔记 Prompt">
            <el-input v-model="promptConfig.note" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item label="划词解析 Prompt">
            <el-input v-model="promptConfig.explain" type="textarea" :rows="3" />
          </el-form-item>

          <div class="btn-group">
            <el-button @click="resetPrompts">恢复默认</el-button>
            <el-button type="primary" @click="saveSettings" :loading="saving"
              >保存 Prompt</el-button
            >
          </div>
        </el-form>
      </el-tab-pane>

      <!-- 3. 调试面板 -->
      <el-tab-pane v-if="isDev" label="调试面板" name="debug">
        <el-button type="primary" class="w-full" @click="generateTestData()"
          >生成模拟数据</el-button
        >
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ModelProviderTemplate } from '../types/storage'
import type { ModelConfig, PromptConfig } from '../types/storage'
import { DEFAULT_CONFIG, DEFAULT_PROMPTS } from '@/types/constant'
import { getModelAndPromptConfig, setModelConfig, setPromptConfig } from '@/helper'
import { generateTestData } from '@/test_debug'

const activeTab = ref('model')
const saving = ref(false)
const modelConfig = reactive<ModelConfig>({ ...DEFAULT_CONFIG })
const promptConfig = reactive<PromptConfig>({ ...DEFAULT_PROMPTS })
const isTipVisible = ref(false)

const isDev = computed(() => {
  return import.meta.env.DEV === true
})

onMounted(async () => {
  const config = await getModelAndPromptConfig()
  if (config.modelConfig) Object.assign(modelConfig, config.modelConfig)
  if (config.promptConfig) Object.assign(promptConfig, config.promptConfig)
})

const handleProviderChange = (val: string) => {
  const provider = ModelProviderTemplate[val as keyof typeof ModelProviderTemplate]
  modelConfig.baseUrl = provider.baseUrl
  modelConfig.model = provider.model
  isTipVisible.value = val === 'other' // 如果选择其他提供商，显示提示信息
}

const saveSettings = async () => {
  saving.value = true
  try {
    await setModelConfig(modelConfig)
    await setPromptConfig(promptConfig)
    ElMessage.success('设置已保存')
  } catch (e) {
    ElMessage.error('保存失败')
    console.error(e)
  } finally {
    saving.value = false
  }
}

// 恢复默认 Prompt
const resetPrompts = () => {
  Object.assign(promptConfig, DEFAULT_PROMPTS)
}

const showSidePanel = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  })
  if (!tab?.id) return
  await chrome.sidePanel.open({ tabId: tab.id })
}
</script>

<style scoped>
.popup-container {
  width: 360px;
  min-height: 450px; /* 扩展弹窗的标准宽度 */
  padding: 16px;
  background-color: #fff;
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑',
    Arial, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
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
</style>
