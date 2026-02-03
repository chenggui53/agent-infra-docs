# 将知识库发布到 GitHub Pages

## 概述

本指南将帮助您将个人知识库发布到 GitHub Pages，使其能够通过互联网访问。GitHub Pages 是 GitHub 提供的免费静态网站托管服务。

## 准备工作

### 1. 创建 GitHub 仓库

1. 登录 GitHub: https://github.com
2. 点击右上角的 "+" 按钮 → "New repository"
3. 填写仓库信息：
   - **Repository name**: `personal-knowledge-base`
   - **Description**: 个人知识库 - 记录学习过程中的知识、经验和思考
   - **Visibility**: 选择 Public（公开）或 Private（私有）
   - **Initialize this repository with a README**: 不要勾选（我们会自己添加）
4. 点击 "Create repository"

### 2. 配置 Git 远程仓库

打开终端，进入您的工作区：

```bash
cd /Users/xiongqi/.openclaw/workspace

# 检查当前状态
git status

# 配置远程仓库（替换为您的 GitHub 用户名）
git remote add origin https://github.com/您的用户名/personal-knowledge-base.git

# 检查配置是否成功
git remote -v
```

## 网站结构

我已经为您创建了以下文件：

### 核心文件
- **`index.html`** - 网站主页，包含响应式设计和动态加载功能
- **`_config.yml`** - GitHub Pages 配置文件
- **`deploy.sh`** - 自动化部署脚本
- **`GITHUB-PAGES-SETUP.md`** - 本设置指南

### 知识库内容
- **`MEMORY.md`** - 您的核心知识库内容
- **`faas-research.md`** - FaaS 技术研究报告
- **`ideas/`** - 想法记录目录
- **`memory/`** - 每日学习笔记目录
- **`skills/`** - 技能文档目录

## 部署步骤

### 方法一：使用自动化脚本（推荐）

```bash
cd /Users/xiongqi/.openclaw/workspace

# 给脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

脚本会自动：
1. 检查依赖
2. 初始化 Git 仓库（如果需要）
3. 配置远程仓库
4. 创建部署分支
5. 构建网站
6. 提交到 GitHub
7. 提供配置指导

### 方法二：手动部署

#### 1. 创建部署分支
```bash
git checkout -b gh-pages
```

#### 2. 准备部署内容
```bash
mkdir -p _site
cp index.html _site/
cp -r assets _site/ 2>/dev/null || true
cp -r css _site/ 2>/dev/null || true
cp -r js _site/ 2>/dev/null || true
cp -r images _site/ 2>/dev/null || true

# 创建内容目录
mkdir -p _site/content
cp MEMORY.md _site/content/
cp faas-research.md _site/content/
cp -r ideas _site/content/ 2>/dev/null || true
cp -r memory _site/content/ 2>/dev/null || true
cp -r skills _site/content/ 2>/dev/null || true
cp -r knowledge _site/content/ 2>/dev/null || true
```

#### 3. 提交和部署
```bash
git add .
git commit -m "部署个人知识库"
git push -u origin gh-pages
```

## 配置 GitHub Pages

### 1. 在 GitHub 上设置 Pages

1. 访问您的仓库: https://github.com/您的用户名/personal-knowledge-base
2. 点击 "Settings" 标签
3. 在左侧菜单选择 "Pages"
4. 在 "Build and deployment" 部分：
   - **Source**: 选择 "Deploy from a branch"
   - **Branch**: 选择 `gh-pages`，文件夹选择 `/ (root)`
   - 点击 "Save"

### 2. 配置自定义域名（可选）

如果您有自己的域名，可以配置：

1. 在 "Custom domain" 字段输入您的域名
2. 在您的 DNS 提供商添加 CNAME 记录：
   - 主机名: www 或 @
   - 类型: CNAME
   - 目标: 您的用户名.github.io

## 网站功能说明

### 1. 响应式设计
- 支持桌面端、平板和移动端
- 自适应布局
- 美观的卡片设计

### 2. 搜索功能
- 实时搜索
- 支持标题、摘要、标签搜索
- 搜索结果高亮

### 3. 导航功能
- 顶部导航栏
- 侧边栏分类
- 标签云
- 统计信息

### 4. 内容展示
- 文章卡片列表
- 分类筛选
- 标签筛选
- 阅读更多功能

## 内容更新

每次您更新知识库内容后，只需重新运行部署脚本：

```bash
cd /Users/xiongqi/.openclaw/workspace
./deploy.sh
```

脚本会自动：
1. 检测变更
2. 重新构建网站
3. 提交到 GitHub
4. 触发 Pages 更新

## 自定义配置

### 1. 网站信息
在 `_config.yml` 中可以修改：
- 网站标题和描述
- 作者信息
- 社交链接
- 主题配色
- 导航菜单

### 2. 样式自定义
在 `index.html` 中可以修改：
- CSS 样式
- 颜色方案
- 布局结构
- 动画效果

### 3. 内容数据
在 `index.html` 的 JavaScript 部分可以修改：
- 分类信息
- 标签信息
- 文章列表
- 统计数据

## 常见问题

### 1. 网站不显示或显示旧内容
- 检查 GitHub Pages 构建状态：https://github.com/您的用户名/personal-knowledge-base/deployments
- 可能需要等待几分钟到几小时才能生效
- 清除浏览器缓存

### 2. 部署失败
- 检查网络连接
- 验证 GitHub 仓库地址是否正确
- 检查文件权限

### 3. 图片或资源无法加载
- 确保图片路径正确
- 检查资源文件是否已上传到仓库
- 使用相对路径

### 4. 搜索功能不工作
- 确保 JavaScript 已启用
- 检查浏览器控制台是否有错误
- 验证内容数据格式

## 高级功能

### 1. 使用 Jekyll（可选）

如果您想要更复杂的网站结构，可以使用 Jekyll：

```bash
# 安装 Jekyll（需要 Ruby）
gem install jekyll bundler

# 创建 Gemfile
cat > Gemfile << 'EOF'
source 'https://rubygems.org'
gem 'jekyll'
gem 'jekyll-paginate'
gem 'jekyll-sitemap'
gem 'jekyll-seo-tag'
EOF

# 安装依赖
bundle install

# 构建网站
bundle exec jekyll build

# 本地预览
bundle exec jekyll serve
```

### 2. 自动化部署

可以使用 GitHub Actions 自动化部署：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v3
      with:
        python-version: '3.x'
    
    - name: Build website
      run: |
        python -m pip install --upgrade pip
        # 安装依赖
        pip install markdown
        
        # 构建静态内容
        python build.py
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
```

## 参考资源

- **GitHub Pages 文档**: https://docs.github.com/cn/pages
- **GitHub Pages 主题**: https://github.com/pages-themes
- **Jekyll 文档**: https://jekyllrb.com/docs/
- **响应式设计**: https://www.w3schools.com/html/html_responsive.asp

## 完成！

您的个人知识库现在已经成功发布到 GitHub Pages！

**网站地址**: https://您的用户名.github.io/personal-knowledge-base/

**部署状态**: 可以通过访问上述地址检查网站是否正常工作。如果第一次访问可能需要一些时间来初始化。
