#!/usr/bin/env python3
"""
搜索想法的脚本
Usage: python3 search-ideas.py --term "搜索词" --type content
"""

import os
import re
import argparse

def search_ideas(term, search_type='content'):
    entries_dir = 'entries'
    results = []
    
    for root, dirs, files in os.walk(entries_dir):
        for file_name in files:
            if file_name.endswith('.md'):
                file_path = os.path.join(root, file_name)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                        if search_type == 'content' and term in content:
                            results.append(file_path)
                        elif search_type == 'title' and term in file_name:
                            results.append(file_path)
                        elif search_type == 'tags' and re.search(f'tags:.*{term}', content):
                            results.append(file_path)
                        elif search_type == 'categories' and re.search(f'categories:.*{term}', content):
                            results.append(file_path)
                            
                except Exception as e:
                    print(f"Error reading file {file_path}: {e}")
    
    return results

def print_results(results):
    print(f"Found {len(results)} results:")
    for result in results:
        print(f"  - {result}")

def main():
    parser = argparse.ArgumentParser(description="搜索知识库")
    parser.add_argument("term", help="搜索词")
    parser.add_argument("-t", "--type", 
                       choices=["content", "title", "tags", "categories"], 
                       default="content", 
                       help="搜索类型（默认：content）")
    
    args = parser.parse_args()
    
    results = search_ideas(args.term, args.type)
    print_results(results)

if __name__ == "__main__":
    main()
