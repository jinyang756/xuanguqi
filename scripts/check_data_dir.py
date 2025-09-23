#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
检查data目录结构的脚本
"""

import os
import sys

# 设置编码
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

def list_directory_structure(path, max_depth=3, indent=0):
    """递归列出目录结构"""
    if indent > max_depth:
        return
    
    try:
        items = os.listdir(path)
        for item in items:
            item_path = os.path.join(path, item)
            print(' ' * indent + '- ' + item + ('/' if os.path.isdir(item_path) else ''))
            if os.path.isdir(item_path):
                list_directory_structure(item_path, max_depth, indent + 2)
    except Exception as e:
        print(' ' * indent + f"无法访问: {str(e)}")

if __name__ == "__main__":
    # 检查data目录
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    print(f"检查data目录: {data_dir}")
    
    if os.path.exists(data_dir):
        print("data目录存在，结构如下:")
        list_directory_structure(data_dir)
        
        # 查看processed目录中的文件
        processed_dir = os.path.join(data_dir, 'processed')
        if os.path.exists(processed_dir):
            print(f"\nprocessed目录中的文件:")
            for file in os.listdir(processed_dir):
                file_path = os.path.join(processed_dir, file)
                file_size = os.path.getsize(file_path) / 1024 / 1024  # 转换为MB
                print(f"- {file} ({file_size:.2f} MB)")
        else:
            print("processed目录不存在")
        
        # 检查是否有原始数据文件
        original_dir = os.path.join(data_dir, 'original')
        if os.path.exists(original_dir):
            print(f"\noriginal目录存在")
        else:
            print("original目录不存在")
    else:
        print("data目录不存在")