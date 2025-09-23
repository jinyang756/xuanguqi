#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
A股数据清理工具
此脚本用于清理和A股无关的数据，并优化项目目录结构
"""

import os
import sys
import json
import re
import shutil
from datetime import datetime

class AStockDataCleaner:
    def __init__(self):
        # 设置工作目录
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_dir = os.path.join(self.base_dir, 'data')
        self.original_dir = os.path.join(self.data_dir, 'original')
        self.processed_dir = os.path.join(self.data_dir, 'processed')
        
        # A股股票代码正则表达式模式（用于文件名匹配）
        self.a_stock_file_patterns = [
            r'^sh60[013]\d{3}\.day$',  # 沪市主板/科创板/创业板
            r'^sz00[012]\d{3}\.day$',  # 深市主板/中小板
            r'^sz300\d{3}\.day$'       # 深市创业板
        ]
        
        # 要保留的处理后文件
        self.keep_processed_files = [
            'stock_data_a_shares_fixed.json',    # 修复编码后的A股数据
            'stock_data_a_shares_filter_report_fixed.txt',  # 修复编码后的过滤报告
        ]
        
        # 日志文件
        self.log_file = os.path.join(self.base_dir, 'a_stock_cleanup_log.txt')
        self.deleted_files = []
        self.deleted_dirs = []
        self.moved_files = []
        
        # 设置编码
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    
    def log(self, message):
        """记录日志信息"""
        print(message)
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - {message}\n")
    
    def initialize_log(self):
        """初始化日志文件"""
        with open(self.log_file, 'w', encoding='utf-8') as f:
            f.write(f"A股数据清理日志\n")
            f.write(f"开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"工作目录: {self.base_dir}\n\n")
    
    def cleanup_processed_data(self):
        """清理processed目录中与A股无关的文件"""
        self.log("\n===== 开始清理processed目录 =====")
        
        if not os.path.exists(self.processed_dir):
            self.log(f"警告: {self.processed_dir} 目录不存在")
            return
        
        # 获取processed目录中的所有文件
        all_files = os.listdir(self.processed_dir)
        
        # 清理不需要的文件
        for file in all_files:
            file_path = os.path.join(self.processed_dir, file)
            if os.path.isfile(file_path) and file not in self.keep_processed_files:
                try:
                    os.remove(file_path)
                    self.deleted_files.append(file_path)
                    self.log(f"已删除: {file}")
                except Exception as e:
                    self.log(f"删除失败: {file} - {str(e)}")
    
    def cleanup_free_stock_data(self):
        """清理免费股票数据文件"""
        self.log("\n===== 开始清理免费股票数据 =====")
        
        free_stock_file = os.path.join(self.data_dir, 'free_stock_data.json')
        if os.path.exists(free_stock_file):
            try:
                os.remove(free_stock_file)
                self.deleted_files.append(free_stock_file)
                self.log(f"已删除: free_stock_data.json")
            except Exception as e:
                self.log(f"删除失败: free_stock_data.json - {str(e)}")
    
    def optimize_directory_structure(self):
        """优化目录结构"""
        self.log("\n===== 开始优化目录结构 =====")
        
        # 创建A股特定的目录结构
        a_stock_original_dir = os.path.join(self.original_dir, 'a_stock_lday')
        if not os.path.exists(a_stock_original_dir):
            os.makedirs(a_stock_original_dir)
            self.log(f"创建目录: {a_stock_original_dir}")
        
        # 整理lday文件
        lday_dir = os.path.join(self.original_dir, 'lday')
        if os.path.exists(lday_dir):
            # 创建临时目录用于存放非A股文件
            non_a_stock_dir = os.path.join(self.original_dir, 'non_a_stock_lday')
            if not os.path.exists(non_a_stock_dir):
                os.makedirs(non_a_stock_dir)
                self.log(f"创建目录: {non_a_stock_dir}")
            
            # 分类.day文件
            day_files = [f for f in os.listdir(lday_dir) if f.endswith('.day')]
            self.log(f"找到 {len(day_files)} 个.day文件需要分类")
            
            a_stock_count = 0
            non_a_stock_count = 0
            
            for file in day_files:
                is_a_stock = False
                for pattern in self.a_stock_file_patterns:
                    if re.match(pattern, file):
                        is_a_stock = True
                        break
                
                source_path = os.path.join(lday_dir, file)
                if is_a_stock:
                    # 移动到A股目录
                    target_path = os.path.join(a_stock_original_dir, file)
                    shutil.move(source_path, target_path)
                    self.moved_files.append((source_path, target_path))
                    a_stock_count += 1
                else:
                    # 移动到非A股目录
                    target_path = os.path.join(non_a_stock_dir, file)
                    shutil.move(source_path, target_path)
                    self.moved_files.append((source_path, target_path))
                    non_a_stock_count += 1
                
                # 显示进度
                if (a_stock_count + non_a_stock_count) % 500 == 0:
                    self.log(f"处理进度: {a_stock_count + non_a_stock_count}/{len(day_files)}")
            
            self.log(f"分类完成: A股文件 {a_stock_count} 个, 非A股文件 {non_a_stock_count} 个")
            
            # 清理空的lday目录
            if not os.listdir(lday_dir):
                os.rmdir(lday_dir)
                self.deleted_dirs.append(lday_dir)
                self.log(f"删除空目录: {lday_dir}")
        
        # 检查daily目录，如果只包含A股数据，可以保留
        daily_dir = os.path.join(self.data_dir, 'daily')
        if os.path.exists(daily_dir):
            daily_files = os.listdir(daily_dir)
            if daily_files:
                self.log(f"保留daily目录，包含 {len(daily_files)} 个文件")
            else:
                os.rmdir(daily_dir)
                self.deleted_dirs.append(daily_dir)
                self.log(f"删除空目录: {daily_dir}")
    
    def create_optimization_report(self):
        """创建优化报告"""
        self.log("\n===== 清理和优化报告 =====")
        
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write("\n===== 清理和优化报告 =====\n")
            
            # 删除的文件统计
            if self.deleted_files:
                f.write(f"\n删除的文件数量: {len(self.deleted_files)}\n")
                for file in self.deleted_files[:10]:  # 只记录前10个
                    rel_path = os.path.relpath(file, self.base_dir)
                    f.write(f"- {rel_path}\n")
                if len(self.deleted_files) > 10:
                    f.write(f"... 还有 {len(self.deleted_files) - 10} 个文件\n")
            else:
                f.write("\n未删除任何文件\n")
            
            # 删除的目录统计
            if self.deleted_dirs:
                f.write(f"\n删除的目录数量: {len(self.deleted_dirs)}\n")
                for dir_path in self.deleted_dirs:
                    rel_path = os.path.relpath(dir_path, self.base_dir)
                    f.write(f"- {rel_path}\n")
            else:
                f.write("\n未删除任何目录\n")
            
            # 移动的文件统计
            if self.moved_files:
                f.write(f"\n移动的文件数量: {len(self.moved_files)}\n")
                f.write("文件已按照A股和非A股分类存放\n")
            else:
                f.write("\n未移动任何文件\n")
            
            # 优化后的目录结构
            f.write("\n\n===== 优化后的目录结构 =====\n")
            f.write("选股器/\n")
            f.write("├── data/\n")
            f.write("│   ├── daily/                  # 特定股票的日线数据\n")
            f.write("│   ├── original/               # 原始数据\n")
            f.write("│   │   ├── a_stock_lday/       # A股原始.day文件\n")
            f.write("│   │   └── non_a_stock_lday/   # 非A股原始.day文件\n")
            f.write("│   └── processed/              # 处理后的数据\n")
            f.write("│       ├── stock_data_a_shares_fixed.json           # 修复编码后的A股数据\n")
            f.write("│       └── stock_data_a_shares_filter_report_fixed.txt  # 修复编码后的过滤报告\n")
            f.write("└── backend/                   # 后端处理脚本\n")
            
            f.write("\n===== 后续建议 =====\n")
            f.write("1. 根据实际需要，可以删除non_a_stock_lday目录以释放空间\n")
            f.write("2. 定期运行filter_a_stocks.py来更新A股数据\n")
            f.write("3. 建议备份重要数据后再进行任何重大操作\n")
            f.write(f"\n完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    def run(self, auto_confirm=False):
        """运行清理和优化工具"""
        self.initialize_log()
        self.log("开始A股数据清理和目录结构优化...")
        
        # 显示警告
        self.log("警告: 此操作将清理和移动项目中的数据文件，请确保已备份重要数据！")
        
        if not auto_confirm:
            try:
                confirm = input("是否继续？(y/n): ")
                
                if confirm.lower() != 'y':
                    self.log("操作已取消")
                    return
            except EOFError:
                # 处理无法获取用户输入的情况
                self.log("无法获取用户输入，使用自动确认模式继续")
                auto_confirm = True
        
        try:
            # 执行清理和优化操作
            self.cleanup_processed_data()
            self.cleanup_free_stock_data()
            self.optimize_directory_structure()
            
            # 创建优化报告
            self.create_optimization_report()
            
            self.log("\nA股数据清理和目录结构优化完成！")
            self.log(f"详细日志请查看: {self.log_file}")
        except Exception as e:
            self.log(f"清理过程中发生错误: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='A股数据清理工具')
    parser.add_argument('--auto-confirm', '-y', action='store_true', help='自动确认所有操作，不询问用户')
    args = parser.parse_args()
    
    cleaner = AStockDataCleaner()
    cleaner.run(auto_confirm=args.auto_confirm)