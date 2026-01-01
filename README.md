# OneStroke - 一划 / AI 划词总结 / AI 划词笔记 / AI 划词解析

基于 Google Chrome Extension 的划词总结插件，使用 AI 进行划词总结、划词笔记、划词解析，并生成摘要、笔记、解析结果。

> 支持最新的 Manifest V3 规范

- [x] 划词总结
      对选择的内容进行总结，并生成摘要
- [x] 划词笔记
      对选择的内容进行笔记，并生成笔记
- [x] 划词解析
      对选择的内容进行解析，并生成解析结果
- [x] 模型配置
  - [x] 模型选择
  - [x] API Key
  - [x] 请求地址
  - [x] 模型名称
  - [x] Prompt 配置
- [x] 历史记录
  - [x] 查看历史记录
  - [x] 搜索/过滤
- [ ] Markdown 渲染
- [ ] 深入探讨(对话)

## 技术栈

1. TypeScript: JavaScript 的超集，提供静态类型检查，提高代码可维护性和可读性
2. Vue3: 前端框架，用于构建用户界面
3. Element Plus: 基于 Vue3 的 UI 框架，用于快速构建美观的界面
4. Prettier: 代码格式化工具统一项目代码风格
5. ESLint: 代码检查工具，统一代码风格，提高代码质量

## 使用

1. 从 Release 下载最新的构建包
2. 解压后，将文件夹重命名为 `OneStroke`
3. 打开 Chrome 浏览器的扩展程序页面，打开 `开发者模式`
4. 点击 `加载已解压的扩展程序` 按钮，选择 `OneStroke` 文件夹
5. 点击 OneStroke 扩展，配置模型和 API Key
6. 任意页面划词，右键菜单选择 `OneStroke`，即可生成摘要、笔记、解析结果

## 构建

```bash
# 安装依赖
npm install

# 构建项目
npm run build
```

## 项目结构

```bash
.
├─public/ # 静态资源
│      manifest.json
│      popup.html
├─src/
│    │  background.ts # 后台脚本
│    │
│    ├─content/ # 内容脚本(悬浮窗)
│    │      App.vue
│    │      content.ts
│    │      loader.ts
│    │
│    ├─popup/ # 弹窗脚本
│    │      App.vue
│    │      main.ts
│    │
│    └─types/ # 类型定义
│           message.ts
│           storage.ts
|
└─ ... # 其它文件(项目配置、脚本等)
```

## 问题记录

### 1. 由于使用 TypeScript 但是因为没有 Chrome 的类型文件，导致编译代码 TS 报错未知的类型

在 Github 上 GoogleChrome 组织下找到了 chrome-types 仓库，npm 安装类型文件后，在 env.d.ts 引入类型文件解决

### 2. 编写完 content 页面内容后，vite 构建打包，chrome 加载扩展报错:

```log
Cannot load extension with file or directory name _plugin-vue_export-helper.js. Filenames starting with "_" are reserved for use by the system.
```

根据报错得知是 chrome 的保护机制？拒绝解析 \_ 开头的模块, 搜寻 Github 找到相关 issue

https://github.com/vuejs/vue/issues/13236
https://github.com/aklinker1/vite-plugin-web-extension/issues/178
https://github.com/vitejs/vite/issues/9119

查看前人的解决方案，重写 `sanitizeFileName` 函数后重新打包，问题解决

### 3. `Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.` 异常

根据报错信息，猜测是 content script 与 background script 之间的通信问题, 调整时序、添加异常处理均无效

排查1小时+，发现是 Content Script 默认运行在非 Module 环境下，不支持 import 语法...

但是 Vite 打包时, 因为 content.ts 和 popup.ts 都引用了 Vue，Vite 自动进行了“代码分割”，生成共享的 Chunk 文件（plugin-vueexport-helper.js），导致 content.js 变成了包含 import 语法的 ESM 模块，从而报错。

> 在扩展的 **错误** 选项卡里, 有另一条报错：`Uncaught SyntaxError: Cannot use import statement outside a module`

解决方案：使用一个空壳文件动态 import 真正的 content.js

### 4. 开发时需要频繁打包，加载扩展，非常麻烦

搜索得知，可以使用 **crxjs** 插件，实现热更新，解决开发时繁琐的构建、重加载

> 迁移到 crxjs 后，发现前面踩过的坑，crxjs 都已经解决了(白踩了)
