#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
项目清理执行脚本
此脚本根据cleanup_project.py生成的建议，实际删除重复和冗余的文件
"""

import os
import sys
import json
from datetime import datetime

class ProjectCleanupExecutor:
    def __init__(self, project_dir):
        self.project_dir = project_dir
        self.deleted_files = []
        self.kept_files = []
        self.log_file = os.path.join(project_dir, 'cleanup_execution_log.txt')
        
        # 定义要删除的文件列表，基于cleanup_project.py的分析结果
        self.files_to_delete = [
            # 数据解析脚本（除了backend/parse_day_files.py，但该文件不存在，所以不删除相关文件）
            # 'parse_stock_data.py',
            # 'parse_all_data.py',
            # 'analyze_stock_data.py',
            
            # 数据整合脚本（只保留integrate_stock_data.py）
            'process_tushare_data.py',
            
            # 编码修复脚本（已合并到fix_encoding.py）
            'fix_encoding.py',
            'count_stocks.py',
            
            # 数据源集成脚本（如果不需要Tushare集成）
            'tushare_integration.py',
            'tushare_basic_data.py',
            
            # 独立的冗余文件
            'stock_data.json'
        ]
        
        # 定义要保留的文件
        self.files_to_keep = [
            'filter_a_stocks.py',
            'fix_encoding.py',
            'run_stock_selector.py',
            'backend/select_stock.py',
            'backend/parse_day_files.py',
            'backend/utils.py',
            'README.md',
            'A股数据过滤说明.md',
            '开发维护日志.md'
        ]
    
    def delete_file(self, file_path):
        """删除文件并记录操作"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                self.deleted_files.append(file_path)
                print(f"已删除: {file_path}")
            else:
                print(f"跳过: {file_path} (文件不存在)")
        except Exception as e:
            print(f"删除失败: {file_path} - {str(e)}")
    
    def merge_documentation(self):
        """合并文档文件"""
        print("\n开始合并文档文件...")
        
        # 合并README.md和启动指南.md
        readme_path = os.path.join(self.project_dir, 'README.md')
        startup_guide_path = os.path.join(self.project_dir, '启动指南.md')
        
        if os.path.exists(readme_path) and os.path.exists(startup_guide_path):
            try:
                # 读取README.md内容
                with open(readme_path, 'r', encoding='utf-8') as f:
                    readme_content = f.read()
                
                # 读取启动指南.md内容
                with open(startup_guide_path, 'r', encoding='utf-8') as f:
                    startup_content = f.read()
                
                # 合并内容
                if '## 使用说明' not in readme_content:
                    merged_content = f"{readme_content}\n\n## 使用说明\n\n{startup_content}"
                    
                    # 写回README.md
                    with open(readme_path, 'w', encoding='utf-8') as f:
                        f.write(merged_content)
                    
                    print(f"已合并启动指南.md到README.md")
                else:
                    print("README.md中已包含使用说明，跳过合并")
            except Exception as e:
                print(f"合并文档失败: {str(e)}")
    
    def create_consolidated_data_documentation(self):
        """创建统一的数据说明文档"""
        print("\n开始创建统一的数据说明文档...")
        
        # 定义数据相关文档
        data_docs = [
            '数据处理报告.md',
            '数据情况说明.md',
            'A股数据过滤说明.md'
        ]
        
        consolidated_content = "# 数据说明文档\n\n" \
                             "本文件整合了项目中所有与数据相关的说明文档内容。\n\n"
        
        # 读取并整合各个数据文档
        for doc in data_docs:
            doc_path = os.path.join(self.project_dir, doc)
            if os.path.exists(doc_path):
                try:
                    with open(doc_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # 添加文档标题和内容
                    consolidated_content += f"## {os.path.splitext(doc)[0]}\n\n"
                    consolidated_content += f"{content}\n\n"
                except Exception as e:
                    print(f"读取{doc}失败: {str(e)}")
        
        # 保存整合后的文档
        consolidated_path = os.path.join(self.project_dir, '数据说明.md')
        try:
            with open(consolidated_path, 'w', encoding='utf-8') as f:
                f.write(consolidated_content)
            print(f"已创建整合的数据说明文档: {consolidated_path}")
        except Exception as e:
            print(f"创建整合文档失败: {str(e)}")
    
    def generate_execution_report(self):
        """生成执行报告"""
        with open(self.log_file, 'w', encoding='utf-8') as log:
            log.write(f"选股器项目清理执行报告\n")
            log.write(f"执行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            if self.deleted_files:
                log.write("\n== 删除的文件 ==\n")
                for file in self.deleted_files:
                    rel_path = os.path.relpath(file, self.project_dir)
                    log.write(f"- {rel_path}\n")
            else:
                log.write("\n== 未删除任何文件 ==\n")
            
            log.write("\n\n== 建议后续操作 ==\n")
            log.write("1. 检查README.md是否包含了所有必要的使用说明\n")
            log.write("2. 查看新创建的'数据说明.md'文档\n")
            log.write("3. 运行测试脚本验证项目功能是否正常\n")
            log.write("4. 如有必要，手动删除剩余的不需要的文档文件\n")
            
        print(f"\n清理执行报告已保存至: {self.log_file}")
    
    def run(self):
        """运行清理执行脚本"""
        print(f"开始执行项目清理: {self.project_dir}")
        
        # 删除冗余文件
        print("\n开始删除冗余文件...")
        for file in self.files_to_delete:
            file_path = os.path.join(self.project_dir, file)
            self.delete_file(file_path)
        
        # 合并文档文件
        self.merge_documentation()
        
        # 创建统一的数据说明文档
        self.create_consolidated_data_documentation()
        
        # 生成执行报告
        self.generate_execution_report()
        
        print("\n清理执行完成！")
        print("注意：对于文档文件，我们创建了合并版本，但保留了原始文件供您检查。")
        print("建议检查合并后的文档，确认内容无误后，再手动删除不需要的原始文档文件。")

if __name__ == "__main__":
    # 设置编码
    if sys.platform.startswith('win'):
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    # 获取项目目录
    project_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 显示警告
    print("警告：此脚本将实际删除项目中的冗余文件。")
    print("请确保已备份重要数据，或确认了解清理操作的影响。")
    confirm = input("是否继续执行清理？(y/n): ")
    
    if confirm.lower() == 'y':
        # 运行清理执行脚本
        executor = ProjectCleanupExecutor(project_dir)
        executor.run()
    else:
        print("已取消清理操作。")