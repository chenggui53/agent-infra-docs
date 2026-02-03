#!/bin/bash

# GitHub 配置脚本
# 设置个人访问令牌
export GITHUB_TOKEN="ghp_your_token_here"

# 配置 Git
git config --global user.name "chenggui53"
git config --global user.email "16697495+chenggui53@users.noreply.github.com"

# 测试连接
echo "Testing GitHub connection..."
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://github.com/api/v3/user

echo "配置完成！"
