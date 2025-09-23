#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
检查原始数据目录的脚本
"""

import os
import sys
import re

# 设置编码
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

def check_original_lday_files():
    """检查原始lday文件"""
    lday_dir = os.path.join(os.path.dirname(__file__), 'data', 'original', 'lday')
    
    print(f"检查原始lday文件目录: {lday_dir}")
    
    if os.path.exists(lday_dir):
        # 获取所有.day文件
        day_files = [f for f in os.listdir(lday_dir) if f.endswith('.day')]
        print(f"找到 {len(day_files)} 个.day文件")
        
        # 分析文件名模式
        file_patterns = {}
        for file in day_files:
            # 提取文件前缀
            prefix = file[:3] if len(file) >= 3 else file
            file_patterns[prefix] = file_patterns.get(prefix, 0) + 1
        
        print("文件前缀分布:")
        for prefix, count in sorted(file_patterns.items()):
            print(f"- {prefix}: {count}个文件")
        
        # 检查是否有明显的非A股文件
        non_a_stock_patterns = ['etf', 'bond', 'fund', 'index']
        possible_non_a_stocks = []
        
        for file in day_files:
            if any(pattern in file.lower() for pattern in non_a_stock_patterns):
                possible_non_a_stocks.append(file)
        
        if possible_non_a_stocks:
            print(f"\n可能的非A股文件 ({len(possible_non_a_stocks)}个):")
            for file in possible_non_a_stocks[:10]:  # 只显示前10个
                print(f"- {file}")
            if len(possible_non_a_stocks) > 10:
                print(f"... 还有 {len(possible_non_a_stocks) - 10} 个文件")
        else:
            print("未发现明显的非A股文件")
    else:
        print("original/lday目录不存在")

if __name__ == "__main__":
    check_original_lday_files()