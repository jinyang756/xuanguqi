import sys
import os
import json

# 设置Windows编码
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

class EncodingFixer:
    def __init__(self):
        # 定义源文件和目标文件路径
        base_dir = os.path.dirname(__file__)
        self.input_json_file = os.path.join(base_dir, 'data', 'processed', 'stock_data_a_shares.json')
        self.output_json_file = os.path.join(base_dir, 'data', 'processed', 'stock_data_a_shares_fixed.json')
        self.input_report_file = os.path.join(base_dir, 'data', 'processed', 'stock_data_a_shares_filter_report.txt')
        self.output_report_file = os.path.join(base_dir, 'data', 'processed', 'stock_data_a_shares_filter_report_fixed.txt')
    
    def fix_json_encoding(self):
        """修复JSON文件的中文编码问题"""
        try:
            print(f"正在修复JSON文件编码: {self.input_json_file}")
            
            # 读取JSON文件
            with open(self.input_json_file, 'r', encoding='utf-8') as f:
                stock_data = json.load(f)
            
            print(f"成功读取 {len(stock_data)} 条A股股票数据")
            
            # 重新写入JSON文件，确保使用正确的编码
            with open(self.output_json_file, 'w', encoding='utf-8') as f:
                json.dump(stock_data, f, ensure_ascii=False, indent=2)
            
            print(f"修复后的JSON文件已保存至: {self.output_json_file}")
            
            # 显示前3条数据作为样本
            print("\n修复后的前3条数据样本:")
            for i, stock in enumerate(stock_data[:3]):
                print(f"\n股票 {i+1}:")
                print(f"代码: {stock.get('code', '未知')}")
                print(f"名称: {stock.get('name', '未知')}")
                print(f"行业: {stock.get('industry', '未知')}")
                print(f"价格: ¥{float(stock.get('price', 0)):.2f}")
                
        except Exception as e:
            print(f"修复JSON文件编码时出错: {str(e)}")
            return False
        return True
    
    def fix_report_encoding(self):
        """修复报告文件的中文编码问题"""
        try:
            print(f"\n正在修复报告文件编码: {self.input_report_file}")
            
            # 读取报告文件
            with open(self.input_report_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 重新写入报告文件，确保使用正确的编码
            with open(self.output_report_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"修复后的报告文件已保存至: {self.output_report_file}")
            
            # 显示报告的前几行
            print("\n修复后的报告摘要:")
            lines = content.split('\n')
            for line in lines[:10]:  # 显示前10行
                if line.strip():
                    print(f"{line}")
                    
        except Exception as e:
            print(f"修复报告文件编码时出错: {str(e)}")
            return False
        return True
    
    def run(self):
        """运行编码修复流程"""
        print("=== A股数据编码修复工具 ===")
        
        # 检查源文件是否存在
        if not os.path.exists(self.input_json_file):
            print(f"错误: 找不到A股数据文件 {self.input_json_file}")
            sys.exit(1)
        
        # 修复JSON文件编码
        json_success = self.fix_json_encoding()
        
        # 修复报告文件编码
        report_success = True
        if os.path.exists(self.input_report_file):
            report_success = self.fix_report_encoding()
        else:
            print(f"警告: 找不到报告文件 {self.input_report_file}")
        
        # 总结修复结果
        if json_success and report_success:
            print("\n=== 编码修复完成 ===")
            print(f"1. 修复后的A股数据文件: {self.output_json_file}")
            print(f"2. 修复后的过滤报告文件: {self.output_report_file}")
            print("提示: 现在可以使用修复后的文件进行选股分析")
            return 0
        else:
            print("\n编码修复过程中出现错误")
            return 1

if __name__ == "__main__":
    # 创建编码修复器并运行
    fixer = EncodingFixer()
    sys.exit(fixer.run())