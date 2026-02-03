# 个人知识库

这是一个基于 GitHub Pages 的个人知识库项目，用于收集、整理和分享知识。

## 项目概述

该项目采用现代化的前端技术栈，提供美观、响应式的界面，支持内容搜索、分类导航、标签系统等功能。

## 技术架构

- **前端框架**：React + TypeScript
- **构建工具**：Vite
- **UI 组件**：ShadCN UI + Tailwind CSS
- **部署平台**：GitHub Pages

## 功能特性

### 📚 知识库管理
- 知识分类和标签系统
- 内容搜索功能
- 响应式设计，支持移动端
- 深色/浅色主题切换

### 🎨 界面设计
- 现代化卡片式布局
- 平滑的动画过渡
- 直观的操作体验
- 支持 Markdown 内容渲染

### 🔧 开发特性
- 自动部署到 GitHub Pages
- 持续集成和部署
- 代码质量检查
- 自动化测试

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 部署

项目使用 GitHub Actions 自动化部署到 GitHub Pages。每次推送到 `main` 分支时，都会自动触发部署流程。

## 目录结构

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml       # 部署工作流
├── public/                  # 静态资源
├── src/
│   ├── components/          # React 组件
│   ├── pages/              # 页面组件
│   ├── hooks/              # 自定义钩子
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript 类型
│   ├── styles/             # 样式文件
│   ├── constants/          # 常量定义
│   └── index.tsx           # 入口文件
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── tailwind.config.js      # Tailwind CSS 配置
```

## 内容管理

### 添加新分类

在 `src/constants/categories.ts` 文件中添加新分类：

```typescript
export const categories = [
  { 
    id: 'architecture', 
    name: '架构技术', 
    icon: '🏗️',
    description: '系统架构、微服务、分布式系统等'
  },
  // 添加新分类...
];
```

### 添加新知识卡片

在 `src/constants/knowledgeBase.ts` 文件中添加新知识卡片：

```typescript
export const knowledgeBase = [
  {
    id: '1',
    title: '系统架构设计',
    category: 'architecture',
    tags: ['系统设计', '架构'],
    description: '学习系统架构设计的核心原则和最佳实践',
    level: 'advanced' as const,
    difficulty: 'hard' as const,
    duration: '12小时',
    resources: [
      {
        type: 'document',
        name: '系统架构设计文档',
        size: '2.5MB',
        downloadUrl: '#'
      }
    ],
    updatedAt: new Date('2026-01-31')
  },
  // 添加新知识卡片...
];
```

## 配置说明

### GitHub Pages 配置

在 `vite.config.ts` 文件中配置基础路径：

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/knowledge-base/', // 与仓库名称一致
  // 其他配置...
});
```

### 部署工作流

在 `.github/workflows/deploy.yml` 文件中配置部署流程：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

## 贡献指南

1. Fork 本仓库
2. 创建新分支
3. 提交更改
4. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues：[https://github.com/chenggui53/knowledge-base/issues](https://github.com/chenggui53/knowledge-base/issues)
- Email：16697495+chenggui53@users.noreply.github.com

---

**最后更新**：2026-01-31
