#!/bin/bash

# GitHub Pages 部署脚本

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
REPO_NAME="agent-infra-docs"
BRANCH="gh-pages"
SOURCE_DIR="."
BUILD_DIR="_site"

# 打印信息
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}GitHub Pages 部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查依赖
echo -e "${YELLOW}检查依赖...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${RED}错误: git 命令未找到${NC}"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}错误: python3 命令未找到${NC}"
    exit 1
fi

# 检查是否在 Git 仓库中
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}未找到 Git 仓库，初始化...${NC}"
    git init
    git config user.name "chenggui53"
    git config user.email "chenggui53@gmail.com"
fi

# 检查远程仓库
REMOTE=$(git remote -v | grep -E "(origin|upstream)" | head -1 | awk '{print $2}')
if [ -z "$REMOTE" ]; then
    echo -e "${YELLOW}未配置远程仓库，请创建 GitHub 仓库并配置...${NC}"
    echo ""
    echo -e "${BLUE}步骤 1: 在 GitHub 上创建仓库${NC}"
    echo -e "访问 https://github.com/new"
    echo -e "仓库名称: ${REPO_NAME}"
    echo -e "描述: 个人知识库"
    echo -e "可见性: 公开或私有"
    echo ""
    echo -e "${BLUE}步骤 2: 配置远程仓库${NC}"
    read -p "请输入 GitHub 仓库地址 (例如 https://github.com/yourusername/${REPO_NAME}.git): " GITHUB_REPO
    git remote add origin "$GITHUB_REPO"
    git remote -v
    echo ""
fi

# 检查分支
if ! git branch | grep -q "$BRANCH"; then
    echo -e "${YELLOW}创建部署分支...${NC}"
    git checkout -b "$BRANCH"
else
    git checkout "$BRANCH"
fi

# 安装依赖（如果需要）
echo -e "${YELLOW}安装依赖...${NC}"
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
fi

if [ -f "package.json" ]; then
    npm install
fi

# 构建网站
echo -e "${YELLOW}构建网站...${NC}"

# 简单的构建过程
mkdir -p "$BUILD_DIR"

# 复制文件
cp index.html "$BUILD_DIR/"
if [ -d "assets" ]; then
    cp -r assets "$BUILD_DIR/"
fi
if [ -d "css" ]; then
    cp -r css "$BUILD_DIR/"
fi
if [ -d "js" ]; then
    cp -r js "$BUILD_DIR/"
fi
if [ -d "images" ]; then
    cp -r images "$BUILD_DIR/"
fi

# 解析 Markdown 文件
echo -e "${YELLOW}解析 Markdown 文件...${NC}"

# 创建内容目录
mkdir -p "$BUILD_DIR/content"

# 查找并解析 Markdown 文件
for file in $(find . -name "*.md" ! -path "*/.git/*" ! -path "*/$BUILD_DIR/*"); do
    if [ -f "$file" ]; then
        # 简化处理，直接复制
        cp "$file" "$BUILD_DIR/content/"
    fi
done

# 检查构建是否成功
if [ ! -f "$BUILD_DIR/index.html" ]; then
    echo -e "${RED}错误: 构建失败，未找到 index.html${NC}"
    exit 1
fi

# 提交到部署分支
echo -e "${YELLOW}提交到部署分支...${NC}"
git add .
git commit -m "更新知识库内容"
git push -u origin "$BRANCH"

# 配置 GitHub Pages
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署成功！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}现在需要在 GitHub 上配置 Pages:${NC}"
echo "1. 访问您的仓库: https://github.com/$(git config user.name)/${REPO_NAME}"
echo "2. 点击 Settings -> Pages"
echo "3. 选择 Build and deployment"
echo "4. Source: Deploy from a branch"
echo "5. Branch: $BRANCH -> / (root)"
echo "6. 点击 Save"
echo ""
echo -e "${BLUE}您的网站将在几分钟内可用:${NC}"
echo "https://$(git config user.name).github.io/${REPO_NAME}/"
echo ""
echo -e "${YELLOW}注意:${NC}"
echo "- 如果是第一次配置，可能需要 10-30 分钟生效"
echo "- 确保分支是 $BRANCH"
echo "- 检查仓库可见性设置"

# 返回原分支
git checkout -
