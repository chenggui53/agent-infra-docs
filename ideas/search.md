# 搜索功能

## 搜索概述

本知识库提供多种搜索方式，帮助您快速找到需要的想法和信息。

## 搜索方法

### 1. 文件系统搜索

#### 使用 `grep` 命令搜索
```bash
# 搜索包含特定关键词的文件
grep -r "机器学习" entries/

# 搜索包含特定标签的文件
grep -r "tags:.*machine-learning" entries/

# 搜索包含特定分类的文件
grep -r "categories:.*人工智能" entries/

# 搜索包含特定年份的文件
grep -r "date:.*2026" entries/
```

#### 搜索特定类型的文件
```bash
# 搜索所有 Markdown 文件
find entries/ -name "*.md"

# 搜索特定月份的文件
find entries/2026/01 -name "*.md"
```

### 2. 使用搜索工具

#### 使用 `ripgrep`（推荐）
```bash
# 安装 ripgrep（如果尚未安装）
brew install ripgrep

# 使用 ripgrep 搜索
rg "机器学习" entries/
```

#### 使用 Sublime Text
1. 打开 Sublime Text
2. 选择 "Find" → "Find in Files"
3. 设置搜索范围为 `entries/` 目录

#### 使用 VS Code
1. 打开 VS Code
2. 选择 "文件" → "打开文件夹"
3. 打开 `entries/` 目录
4. 使用搜索功能

### 3. 标签和分类搜索

#### 按标签搜索
```bash
# 搜索包含特定标签的文件
grep -r "tags:.*python" entries/
```

#### 按分类搜索
```bash
# 搜索特定分类的文件
grep -r "categories:.*技术" entries/
```

#### 组合搜索
```bash
# 搜索包含特定标签和分类的文件
grep -r "tags:.*python" entries/ | grep "categories:.*编程"
```

## 高级搜索技巧

### 1. 正则表达式搜索
```bash
# 搜索包含特定模式的内容
grep -r "机器学习.*优化" entries/

# 搜索包含数字的标题
grep -r "title:.*[0-9]" entries/
```

### 2. 搜索特定内容类型
```bash
# 搜索包含代码块的文件
grep -r "```" entries/

# 搜索包含表格的文件
grep -r "|.*|" entries/
```

### 3. 文件内容分析
```bash
# 统计文件数量
find entries/ -name "*.md" | wc -l

# 统计总字数
wc -w entries/**/*.md

# 查找空文件
find entries/ -name "*.md" -size 0
```

## 搜索脚本

### 1. 简单搜索脚本
```bash
#!/bin/bash
# search.sh - 简单搜索脚本

search_term="$1"
if [ -z "$search_term" ]; then
    echo "Usage: $0 <search-term>"
    exit 1
fi

grep -r "$search_term" entries/ --include="*.md"
```

### 2. 高级搜索脚本
```python
#!/usr/bin/env python3
# search.py - 高级搜索脚本

import os
import re
import argparse

def search_knowledge_base(search_term, search_type='content'):
    entries_dir = 'entries'
    results = []
    
    for root, dirs, files in os.walk(entries_dir):
        for file_name in files:
            if file_name.endswith('.md'):
                file_path = os.path.join(root, file_name)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                        if search_type == 'content' and search_term in content:
                            results.append(file_path)
                        elif search_type == 'title' and search_term in file_name:
                            results.append(file_path)
                        elif search_type == 'tags' and f'tags:.*{search_term}' in content:
                            results.append(file_path)
                        elif search_type == 'categories' and f'categories:.*{search_term}' in content:
                            results.append(file_path)
                            
                except Exception as e:
                    print(f"Error reading file {file_path}: {e}")
    
    return results

def print_results(results):
    print(f"Found {len(results)} results:")
    for result in results:
        print(f"  - {result}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Search the knowledge base")
    parser.add_argument("search_term", help="Term to search for")
    parser.add_argument("-t", "--type", choices=["content", "title", "tags", "categories"], 
                       default="content", help="Search type (default: content)")
    
    args = parser.parse_args()
    
    results = search_knowledge_base(args.search_term, args.type)
    print_results(results)
```

### 使用方法
```bash
# 简单搜索
bash search.sh "机器学习"

# 高级搜索
python3 search.py "机器学习"
python3 search.py "python" -t tags
python3 search.py "编程" -t categories
```

## 知识管理建议

### 1. 定期整理
- 定期清理无用文件
- 更新分类和标签
- 统一格式和结构

### 2. 搜索优化
- 使用一致的命名规范
- 保持标签系统的简洁性
- 定期备份知识库

### 3. 工具建议
- 使用 Git 进行版本控制
- 考虑使用知识库软件（如 Obsidian）
- 定期备份重要内容

## 故障排除

### 常见搜索问题

#### 搜索结果不完整
- 检查搜索路径是否正确
- 确保文件权限设置正确
- 检查文件编码格式

#### 搜索速度慢
- 优化搜索算法
- 使用更高效的搜索工具
- 定期清理无用文件

#### 搜索结果不准确
- 调整搜索关键词
- 使用更具体的搜索条件
- 优化标签系统

---

**最后更新**：2026年1月31日
