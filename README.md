# OneStroke - 一划 / AI 划词总结 / AI 划词笔记 / AI 划词解析

基于 Google Chrome Extension 的划词总结插件，使用 AI 进行划词总结、划词笔记、划词解析，并生成摘要、笔记、解析结果。

> 支持最新的 Manifest V3 规范

- [ ] 划词总结
      对选择的内容进行总结，并生成摘要
- [ ] 划词笔记
      对选择的内容进行笔记，并生成笔记
- [ ] 划词解析
      对选择的内容进行解析，并生成解析结果
- [ ] 模型配置
  - [ ] 模型选择
  - [ ] Prompt 配置
  - [ ] API Token 配置
- [ ] 历史记录

## 技术栈

1. 使用 JavaScript 的超集 TypeScript 进行开发，TypeScript 提供静态类型检查，提高代码可维护性和可读性。
2. Vue3，为了编写方便以及布局方便，使用了 Vue3 作为前端框架。
3. Prettier，代码格式化工具统一项目代码风格
4. ESLint，代码检查工具，统一代码风格，提高代码质量
5. element-plus，基于 Vue3 的 UI 框架，用于快速构建美观的界面

## 问题

1. 由于使用 TypeScript 但是因为没有 Chrome 的类型文件，导致编译代码 TS 报错未知的类型

在 Github 上 GoogleChrome 组织下找到了 chrome-types 仓库，npm 安装类型文件后，在 env.d.ts 引入类型文件解决
