#!/usr/bin/env python3
"""
创建新想法的脚本
Usage: python3 create-idea.py --title "想法标题" --category "分类" --tags "标签1,标签2"
"""

import os
import datetime
import argparse
import re

def create_idea(title, category, tags, template="idea"):
    # 生成文件名
    now = datetime.datetime.now()
    date_str = now.strftime("%Y%m%d-%H%M%S")
    
    # 清理标题用于文件名
    safe_title = re.sub(r'[^\w\s-]', '', title)
    safe_title = safe_title.strip().replace(' ', '-').lower()
    filename = f"{date_str}-{safe_title}.md"
    
    # 创建目录
    year_dir = os.path.join("entries", str(now.year))
    month_dir = os.path.join(year_dir, now.strftime("%m"))
    os.makedirs(month_dir, exist_ok=True)
    
    # 构建文件路径
    file_path = os.path.join(month_dir, filename)
    
    # 加载模板
    template_file = os.path.join("templates", f"{template}.md")
    
    if not os.path.exists(template_file):
        print(f"模板文件 {template_file} 不存在")
        return
    
    with open(template_file, 'r', encoding='utf-8') as f:
        template_content = f.read()
    
    # 替换模板变量
    content = template_content.replace("[想法标题]", title)
    content = content.replace("[YYYY-MM-DD HH:MM:SS]", now.strftime("%Y-%m-%d %H:%M:%S"))
    content = content.replace("[分类1, 分类2]", category)
    content = content.replace("[标签1, 标签2]", tags)
    content = content.replace("[您的名字]", "您的名字")
    
    # 保存文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"想法已创建：{file_path}")

def main():
    parser = argparse.ArgumentParser(description="创建新想法")
    parser.add_argument("--title", required=True, help="想法标题")
    parser.add_argument("--category", required=True, help="分类（如：人工智能/机器学习）")
    parser.add_argument("--tags", required=True, help="标签（如：machine-learning, optimization）")
    parser.add_argument("--template", default="idea", help="模板类型（idea, learn, project, question）")
    
    args = parser.parse_args()
    
    create_idea(
        title=args.title,
        category=args.category,
        tags=args.tags,
        template=args.template
    )

if __name__ == "__main__":
    main()
