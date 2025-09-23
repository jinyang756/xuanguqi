#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
验证A股数据清理结果的工具
"""

import os
import sys
import json
from datetime import datetime

class CleanupVerifier:
    def __init__(self):
        # 设置工作目录
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_dir = os.path.join(self.base_dir, 'data')
        self.original_dir = os.path.join(self.data_dir, 'original')
        self.processed_dir = os.path.join(self.data_dir, 'processed')
        self.daily_dir = os.path.join(self.data_dir, 'daily')
        
        # A股相关的处理后文件
        self.expected_processed_files = [
            'stock_data_a_shares_fixed.json',    # 修复编码后的A股数据
            'stock_data_a_shares_filter_report_fixed.txt',  # 修复编码后的过滤报告
        ]
        
        # 日志文件
        self.log_file = os.path.join(self.base_dir, 'verify_cleanup_log.txt')
        
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
            f.write(f"A股数据清理验证日志\n")
            f.write(f"开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"工作目录: {self.base_dir}\n\n")
    
    def verify_processed_directory(self):
        """验证processed目录的清理结果"""
        self.log("\n===== 验证processed目录 =====")
        
        if not os.path.exists(self.processed_dir):
            self.log(f"错误: {self.processed_dir} 目录不存在")
            return False
        
        # 获取processed目录中的所有文件
        all_files = [f for f in os.listdir(self.processed_dir) if os.path.isfile(os.path.join(self.processed_dir, f))]
        
        # 检查是否只包含预期的文件
        unexpected_files = [f for f in all_files if f not in self.expected_processed_files]
        
        if unexpected_files:
            self.log(f"警告: 发现 {len(unexpected_files)} 个非预期文件:")
            for file in unexpected_files:
                self.log(f"- {file}")
            
        # 检查预期文件是否存在
        missing_files = [f for f in self.expected_processed_files if f not in all_files]
        
        if missing_files:
            self.log(f"错误: 缺少 {len(missing_files)} 个预期文件:")
            for file in missing_files:
                self.log(f"- {file}")
            return False
        
        self.log(f"成功: processed目录包含 {len(all_files)} 个文件，均为预期的A股相关文件")
        
        # 检查文件大小
        for file in self.expected_processed_files:
            file_path = os.path.join(self.processed_dir, file)
            size_mb = os.path.getsize(file_path) / (1024 * 1024)
            self.log(f"- {file}: {size_mb:.2f} MB")
            
        return True
    
    def verify_original_directory(self):
        """验证original目录的优化结果"""
        self.log("\n===== 验证original目录 =====")
        
        if not os.path.exists(self.original_dir):
            self.log(f"错误: {self.original_dir} 目录不存在")
            return False
        
        # 检查是否创建了A股和非A股目录
        a_stock_dir = os.path.join(self.original_dir, 'a_stock_lday')
        non_a_stock_dir = os.path.join(self.original_dir, 'non_a_stock_lday')
        
        if not os.path.exists(a_stock_dir):
            self.log(f"错误: A股目录 {a_stock_dir} 不存在")
            return False
        
        if not os.path.exists(non_a_stock_dir):
            self.log(f"错误: 非A股目录 {non_a_stock_dir} 不存在")
            return False
        
        # 检查lday目录是否已删除
        old_lday_dir = os.path.join(self.original_dir, 'lday')
        if os.path.exists(old_lday_dir):
            self.log(f"警告: 旧的lday目录 {old_lday_dir} 仍然存在")
        else:
            self.log("成功: 旧的lday目录已删除")
        
        # 统计A股和非A股文件数量
        a_stock_files = [f for f in os.listdir(a_stock_dir) if f.endswith('.day')]
        non_a_stock_files = [f for f in os.listdir(non_a_stock_dir) if f.endswith('.day')]
        
        self.log(f"A股目录包含 {len(a_stock_files)} 个.day文件")
        self.log(f"非A股目录包含 {len(non_a_stock_files)} 个.day文件")
        
        return True
    
    def verify_free_stock_data(self):
        """验证免费股票数据文件是否已删除"""
        self.log("\n===== 验证免费股票数据 =====")
        
        free_stock_file = os.path.join(self.data_dir, 'free_stock_data.json')
        
        if os.path.exists(free_stock_file):
            self.log(f"错误: 免费股票数据文件 {free_stock_file} 仍然存在")
            return False
        else:
            self.log("成功: 免费股票数据文件已删除")
        
        return True
    
    def check_daily_directory(self):
        """检查daily目录"""
        self.log("\n===== 检查daily目录 =====")
        
        if os.path.exists(self.daily_dir):
            daily_files = os.listdir(self.daily_dir)
            self.log(f"daily目录存在，包含 {len(daily_files)} 个文件")
        else:
            self.log("daily目录不存在")
        
        return True
    
    def display_directory_structure(self):
        """显示优化后的目录结构"""
        self.log("\n===== 优化后的目录结构 =====")
        
        # 定义目录结构
        structure = [
            "选股器/",
            "├── data/",
            "│   ├── daily/                  # 特定股票的日线数据",
            "│   ├── original/               # 原始数据",
            "│   │   ├── a_stock_lday/       # A股原始.day文件",
            "│   │   └── non_a_stock_lday/   # 非A股原始.day文件",
            "│   └── processed/              # 处理后的数据",
            "│       ├── stock_data_a_shares_fixed.json           # 修复编码后的A股数据",
            "│       └── stock_data_a_shares_filter_report_fixed.txt  # 修复编码后的过滤报告",
            "└── backend/                   # 后端处理脚本"
        ]
        
        for line in structure:
            self.log(line)
    
    def create_verification_report(self, results):
        """创建验证报告"""
        self.log("\n===== 清理验证报告 =====")
        
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write("\n===== 清理验证报告 =====\n")
            
            # 验证结果汇总
            f.write("\n验证结果汇总:\n")
            all_passed = True
            
            for check_name, passed in results.items():
                status = "✓ 通过" if passed else "✗ 失败"
                f.write(f"- {check_name}: {status}\n")
                if not passed:
                    all_passed = False
            
            # 总体评估
            f.write("\n总体评估:\n")
            if all_passed:
                f.write("✅ A股数据清理和目录结构优化已成功完成！\n")
            else:
                f.write("⚠️ A股数据清理和目录结构优化存在一些问题，请查看详细日志。\n")
            
            # 后续建议
            f.write("\n\n===== 后续建议 =====\n")
            f.write("1. 定期运行filter_a_stocks.py来更新A股数据\n")
            f.write("2. 根据实际需要，可以删除non_a_stock_lday目录以释放空间\n")
            f.write("3. 建议备份重要数据后再进行任何重大操作\n")
            f.write("4. 运行选股器前，确保A股数据文件完整且格式正确\n")
            f.write(f"\n完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    def run(self):
        """运行验证工具"""
        self.initialize_log()
        self.log("开始验证A股数据清理结果...")
        
        results = {
            "processed目录清理": self.verify_processed_directory(),
            "original目录优化": self.verify_original_directory(),
            "免费股票数据删除": self.verify_free_stock_data(),
            "daily目录检查": self.check_daily_directory()
        }
        
        # 显示目录结构
        self.display_directory_structure()
        
        # 创建验证报告
        self.create_verification_report(results)
        
        self.log("\nA股数据清理验证完成！")
        self.log(f"详细验证报告请查看: {self.log_file}")

if __name__ == "__main__":
    verifier = CleanupVerifier()
    verifier.run()