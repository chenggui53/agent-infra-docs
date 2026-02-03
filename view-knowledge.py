#!/usr/bin/env python3
"""
知识库查看工具 - 提供多种方式查看您的知识内容
"""

import os
import sys
import re
import webbrowser
from datetime import datetime

# 知识库路径
MEMORY_FILE = "/Users/xiongqi/.openclaw/workspace/MEMORY.md"
DAILY_NOTES_DIR = "/Users/xiongqi/.openclaw/workspace/memory"
FAAS_RESEARCH = "/Users/xiongqi/.openclaw/workspace/faas-research.md"

def print_header(title):
    """打印标题"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def view_memory():
    """查看核心知识库"""
    print_header("核心知识库 (MEMORY.md)")
    
    with open(MEMORY_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 提取标题结构
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if line.startswith('#') and len(line.strip()) > 1:
            level = line.count('#')
            title = line.strip('#').strip()
            print(f"{'  '*(level-1)}{'•' if level > 1 else '→'} {title}")
            
            if level == 1:
                print()

def view_daily_notes():
    """查看每日学习笔记"""
    print_header("每日学习笔记")
    
    files = []
    if os.path.exists(DAILY_NOTES_DIR) and os.path.isdir(DAILY_NOTES_DIR):
        for filename in os.listdir(DAILY_NOTES_DIR):
            if filename.endswith('.md') and len(filename) == len('2026-01-31.md'):
                filepath = os.path.join(DAILY_NOTES_DIR, filename)
                if os.path.isfile(filepath):
                    files.append((filename, filepath))
    
    # 按日期排序
    files.sort(key=lambda x: x[0], reverse=True)
    
    for filename, filepath in files:
        date_str = filename[:-3]
        with open(filepath, 'r', encoding='utf-8') as f:
            first_line = f.readline().strip()
        print(f"📅 {date_str} - {first_line}")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            count = content.count('\n') + 1
            size = os.path.getsize(filepath)
        
        print(f"   📝 {count}行 | {size}字节")

def view_research():
    """查看专项研究报告"""
    print_header("专项研究报告")
    
    if os.path.exists(FAAS_RESEARCH):
        size = os.path.getsize(FAAS_RESEARCH)
        with open(FAAS_RESEARCH, 'r', encoding='utf-8') as f:
            content = f.read()
            count = content.count('\n') + 1
        
        print(f"🔬 FaaS（函数即服务）关键技术研究")
        print(f"   📝 {count}行 | {size}字节")
        
        # 提取主要章节
        with open(FAAS_RESEARCH, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('##') and len(line.strip()) > 2:
                    print(f"   • {line.strip('#').strip()}")

def search_keyword(keyword):
    """搜索关键词"""
    print_header(f"搜索关键词: '{keyword}'")
    
    files_to_search = [
        (MEMORY_FILE, "核心知识库"),
        (FAAS_RESEARCH, "FaaS研究报告"),
    ]
    
    # 每日笔记
    if os.path.exists(DAILY_NOTES_DIR) and os.path.isdir(DAILY_NOTES_DIR):
        for filename in os.listdir(DAILY_NOTES_DIR):
            if filename.endswith('.md'):
                filepath = os.path.join(DAILY_NOTES_DIR, filename)
                files_to_search.append((filepath, filename))
    
    found = False
    for filepath, name in files_to_search:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
                if keyword.lower() in content.lower():
                    found = True
                    print(f"\n📄 {name}")
                    
                    # 显示包含关键词的上下文
                    lines = content.split('\n')
                    for i, line in enumerate(lines):
                        if keyword.lower() in line.lower():
                            context = []
                            start = max(0, i-2)
                            end = min(len(lines), i+3)
                            for j in range(start, end):
                                line_content = lines[j].strip()
                                if line_content:
                                    if j == i:
                                        # 高亮关键词
                                        highlighted = line_content.replace(keyword, f"[1;31;40m{keyword}[0m")
                                        context.append(f"  [1;34m{j+1}[0m: {highlighted}")
                                    else:
                                        context.append(f"  {j+1}: {line_content}")
                            
                            print('\n'.join(context))
                            print()
    
    if not found:
        print("\n🔍 未找到匹配的关键词")

def open_in_browser(filepath, name):
    """在浏览器中打开"""
    import tempfile
    
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 简单的 Markdown 到 HTML 转换
        html_content = f"""
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{name}</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                }}
                h1 {{ color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px; }}
                h2 {{ color: #555; }}
                pre, code {{
                    background-color: #f8f8f8;
                    padding: 10px;
                    border-radius: 5px;
                    font-family: monospace;
                }}
                blockquote {{
                    border-left: 4px solid #ddd;
                    padding-left: 20px;
                    margin: 10px 0;
                    color: #666;
                }}
                table {{
                    border-collapse: collapse;
                    width: 100%;
                    margin: 10px 0;
                }}
                th, td {{
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }}
                th {{ background-color: #f2f2f2; }}
            </style>
        </head>
        <body>
            <div class="content">
                {content}
            </div>
        </body>
        </html>
        """
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as f:
            f.write(html_content)
        
        webbrowser.open(f.name)
        print(f"🌐 已在浏览器中打开: {name}")

def main():
    """主函数"""
    if len(sys.argv) > 1:
        if sys.argv[1] == 'search' and len(sys.argv) > 2:
            keyword = sys.argv[2]
            search_keyword(keyword)
        elif sys.argv[1] == 'open' and len(sys.argv) > 2:
            file_type = sys.argv[2]
            if file_type == 'memory':
                open_in_browser(MEMORY_FILE, "核心知识库")
            elif file_type == 'faas':
                open_in_browser(FAAS_RESEARCH, "FaaS研究报告")
            elif file_type == 'daily':
                open_in_browser(os.path.join(DAILY_NOTES_DIR, '2026-01-31.md'), "每日笔记")
            else:
                print("无效的文件类型")
        else:
            print("无效的参数")
    else:
        # 显示菜单
        print("🎓 知识库查看工具")
        print("="*60)
        print("1. 查看核心知识库 (MEMORY.md)")
        print("2. 查看每日学习笔记")
        print("3. 查看专项研究报告")
        print("4. 在浏览器中打开核心知识库")
        print("5. 在浏览器中打开FaaS研究报告")
        print("6. 搜索关键词")
        print("0. 退出")
        print("="*60)
        
        try:
            choice = input("请选择操作 (0-6): ")
            if choice == '1':
                view_memory()
            elif choice == '2':
                view_daily_notes()
            elif choice == '3':
                view_research()
            elif choice == '4':
                open_in_browser(MEMORY_FILE, "核心知识库")
            elif choice == '5':
                open_in_browser(FAAS_RESEARCH, "FaaS研究报告")
            elif choice == '6':
                keyword = input("请输入要搜索的关键词: ")
                search_keyword(keyword)
            elif choice == '0':
                print("再见！")
                return
            else:
                print("无效的选择")
        except KeyboardInterrupt:
            print("\n\n操作已取消")
        except Exception as e:
            print(f"错误: {e}")

if __name__ == "__main__":
    main()
