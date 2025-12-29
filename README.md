# OneStroke - 一划 / AI 划词总结 / AI 划词笔记 / AI 划词解析

## 技术栈

1. 使用 JavaScript 的超集 TypeScript 进行开发，TypeScript 提供静态类型检查，提高代码可维护性和可读性。
2. Vue3，为了编写方便以及布局方便，使用了 Vue3 作为前端框架。
3. Prettier，代码格式化工具统一项目代码风格
4. ESLint，代码检查工具，统一代码风格，提高代码质量

## 问题

1. 由于使用 TypeScript 但是因为没有 Chrome 的类型文件，导致编译代码 TS 报错未知的类型

在 Github 上 GoogleChrome 组织下找到了 chrome-types 仓库，npm 安装类型文件后，在 env.d.ts 引入类型文件解决
