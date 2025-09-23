#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
项目清理工具
此脚本用于分析项目中的重复文件并提供清理建议
"""

import os
import sys
import hashlib
import json
from datetime import datetime

class ProjectCleaner:
    def __init__(self, project_dir):
        self.project_dir = project_dir
        self.duplicate_files = []
        self.redundant_files = []
        self.error_files = []
        self.log_file = os.path.join(project_dir, 'cleanup_log.txt')
        
        # 定义功能重复的文件组
        self.duplicate_groups = [
            {
                'description': '数据解析脚本',
                'files': [
                    'parse_stock_data.py',
                    'parse_all_data.py',
                    'analyze_stock_data.py'
                ],
                'recommended': 'parse_day_files.py'  # 后端目录下的文件
            },
            {
                'description': '数据整合脚本',
                'files': [
                    'integrate_stock_data.py',
                    'process_tushare_data.py'
                ],
                'recommended': 'integrate_stock_data.py'
            },
            {
                'description': '编码修复脚本',
                'files': [
                    'fix_encoding.py',
                    'count_stocks.py'
                ],
                'recommended': 'fix_encoding.py'
            },
            {
                'description': '数据源集成脚本',
                'files': [
                    'tushare_integration.py',
                    'tushare_basic_data.py'
                ],
                'recommended': None  # 如果不需要Tushare集成，可以全部删除
            }
        ]
        
        # 独立的冗余文件
        self.single_redundant = [
            'stock_data.json'  # 应该放在data/processed目录下
        ]
        
        # 文档文件整合建议
        self.document_groups = [
            {
                'description': '项目说明文档',
                'files': [
                    'README.md',
                    '启动指南.md'
                ],
                'recommended': 'README.md'  # 合并到README.md
            },
            {
                'description': '数据说明文档',
                'files': [
                    '数据处理报告.md',
                    '数据情况说明.md',
                    'A股数据过滤说明.md'
                ],
                'recommended': '数据说明.md'  # 建议合并为一个文件
            }
        ]
    
    def scan_for_errors(self):
        """扫描可能的错误文件"""
        print("正在扫描可能的错误文件...")
        
        # 检查是否存在语法错误的文件
        for root, _, files in os.walk(self.project_dir):
            for file in files:
                if file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    try:
                        # 简单的语法检查
                        with open(file_path, 'rb') as f:
                            compile(f.read(), file_path, 'exec')
                    except SyntaxError as e:
                        self.error_files.append({
                            'path': file_path,
                            'error': f"语法错误: {str(e)}"
                        })
                    except Exception as e:
                        self.error_files.append({
                            'path': file_path,
                            'error': f"其他错误: {str(e)}"
                        })
    
    def generate_report(self):
        """生成清理报告"""
        print("\n===== 项目清理报告 =====")
        
        # 打开日志文件
        with open(self.log_file, 'w', encoding='utf-8') as log:
            log.write(f"选股器项目清理报告\n")
            log.write(f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            # 功能重复的文件
            if self.duplicate_groups:
                log.write("\n== 功能重复的文件 ==\n")
                print("\n== 功能重复的文件 ==")
                
                for group in self.duplicate_groups:
                    log.write(f"\n{group['description']}:\n")
                    print(f"\n{group['description']}:")
                    
                    for file in group['files']:
                        file_path = os.path.join(self.project_dir, file)
                        if os.path.exists(file_path):
                            log.write(f"- {file}\n")
                            print(f"- {file}")
                    
                    if group['recommended']:
                        rec_path = os.path.join(self.project_dir, group['recommended']) if not group['recommended'].startswith('backend/') else os.path.join(self.project_dir, group['recommended'])
                        exists = "(存在)" if os.path.exists(rec_path) else "(不存在)"
                        log.write(f"建议保留: {group['recommended']} {exists}\n")
                        print(f"建议保留: {group['recommended']} {exists}")
            
            # 独立的冗余文件
            if self.single_redundant:
                log.write("\n\n== 独立的冗余文件 ==\n")
                print("\n== 独立的冗余文件 ==")
                
                for file in self.single_redundant:
                    file_path = os.path.join(self.project_dir, file)
                    if os.path.exists(file_path):
                        log.write(f"- {file}\n")
                        print(f"- {file}")
            
            # 文档文件整合建议
            if self.document_groups:
                log.write("\n\n== 文档文件整合建议 ==\n")
                print("\n== 文档文件整合建议 ==")
                
                for group in self.document_groups:
                    log.write(f"\n{group['description']}:\n")
                    print(f"\n{group['description']}:")
                    
                    for file in group['files']:
                        file_path = os.path.join(self.project_dir, file)
                        if os.path.exists(file_path):
                            log.write(f"- {file}\n")
                            print(f"- {file}")
                    
                    log.write(f"建议: {'保留' + group['recommended'] if group['recommended'] else '删除或整合'}\n")
                    print(f"建议: {'保留' + group['recommended'] if group['recommended'] else '删除或整合'}")
            
            # 错误文件
            if self.error_files:
                log.write("\n\n== 存在错误的文件 ==\n")
                print("\n== 存在错误的文件 ==")
                
                for error_file in self.error_files:
                    rel_path = os.path.relpath(error_file['path'], self.project_dir)
                    log.write(f"- {rel_path}: {error_file['error']}\n")
                    print(f"- {rel_path}: {error_file['error']}")
            
            # 清理建议总结
            log.write("\n\n== 清理建议总结 ==\n")
            log.write("1. 删除功能重复的文件，保留推荐的版本\n")
            log.write("2. 删除独立的冗余文件\n")
            log.write("3. 整合文档文件，避免内容重复\n")
            log.write("4. 修复或删除存在错误的文件\n")
            log.write("5. 清理完成后，建议运行测试脚本验证功能是否正常\n")
            
            print("\n清理报告已保存至: cleanup_log.txt")
            print("请查看报告并根据建议手动清理文件")
    
    def run(self):
        """运行清理工具"""
        print(f"开始清理项目: {self.project_dir}")
        self.scan_for_errors()
        self.generate_report()

if __name__ == "__main__":
    # 设置编码
    if sys.platform.startswith('win'):
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    # 获取项目目录
    project_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 运行清理工具
    cleaner = ProjectCleaner(project_dir)
    cleaner.run()