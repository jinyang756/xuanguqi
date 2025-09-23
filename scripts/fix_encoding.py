import os
import json
import sys

# 设置Windows编码
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

class EncodingFixer:
    def __init__(self, is_a_stock=False):
        # 定义源文件和目标文件路径
        base_dir = os.path.dirname(__file__)
        
        # 根据是否为A股设置不同的文件路径
        if is_a_stock:
            self.input_json_file = os.path.join(base_dir, 'data', 'processed', 'stock_data_a_shares.json')
            self.output_json_file = os.path.join(base_dir, 'data', 'processed', 'stock_data_a_shares_fixed.json')
            self.input_report_file = os.path.join(base_dir, 'data', 'processed', 'stock_data_a_shares_filter_report.txt')
            self.output_report_file = os.path.join(base_dir, 'data', 'processed', 'stock_data_a_shares_filter_report_fixed.txt')
            self.type = "A股"
        else:
            self.input_json_file = os.path.join(base_dir, 'data', 'processed', 'stock_data.json')
            self.output_json_file = os.path.join(base_dir, 'data', 'processed', 'stock_data_fixed.json')
            self.input_report_file = None
            self.output_report_file = None
            self.type = "通用"
    
    def fix_json_encoding(self):
        """修复JSON文件的中文编码问题"""
        try:
            print(f"正在修复{self.type}JSON文件编码: {self.input_json_file}")
            
            # 读取JSON文件
            with open(self.input_json_file, 'r', encoding='utf-8') as f:
                stock_data = json.load(f)
            
            print(f"成功读取 {len(stock_data)} 条{self.type}股票数据")
            
            # 对A股数据进行特定处理
            if self.type == "A股":
                # 修复行业名称编码问题
                for stock in stock_data:
                    if 'industry' in stock:
                        # 这里可以添加特定的A股行业名称修复逻辑
                        pass
            
            # 重新写入JSON文件，确保使用正确的编码
            with open(self.output_json_file, 'w', encoding='utf-8') as f:
                json.dump(stock_data, f, ensure_ascii=False, indent=2)
            
            print(f"修复后的JSON文件已保存至: {self.output_json_file}")
            
            # 显示前3条数据作为样本
            print(f"\n修复后的前3条{self.type}数据样本:")
            for i, stock in enumerate(stock_data[:3]):
                print(f"\n股票 {i+1}:")
                print(f"代码: {stock.get('code', '未知')}")
                print(f"名称: {stock.get('name', '未知')}")
                print(f"行业: {stock.get('industry', '未知')}")
                print(f"价格: ¥{float(stock.get('price', 0)):.2f}")
                
        except Exception as e:
            print(f"修复{self.type}JSON文件编码时出错: {str(e)}")
            return False
        return True
    
    def fix_report_encoding(self):
        """修复报告文件的中文编码问题"""
        if not self.input_report_file:
            return True
            
        try:
            print(f"\n正在修复{self.type}报告文件编码: {self.input_report_file}")
            
            # 读取报告文件
            with open(self.input_report_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 重新写入报告文件，确保使用正确的编码
            with open(self.output_report_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"修复后的报告文件已保存至: {self.output_report_file}")
            
            # 显示报告的前几行
            print(f"\n修复后的{self.type}报告摘要:")
            lines = content.split('\n')
            for line in lines[:10]:  # 显示前10行
                if line.strip():
                    print(f"{line}")
                    
        except Exception as e:
            print(f"修复{self.type}报告文件编码时出错: {str(e)}")
            return False
        return True
    
    def run(self):
        """运行编码修复流程"""
        print(f"=== {self.type}数据编码修复工具 ===")
        
        # 检查源文件是否存在
        if not os.path.exists(self.input_json_file):
            print(f"错误: 找不到{self.type}数据文件 {self.input_json_file}")
            return False
        
        # 修复JSON文件编码
        json_success = self.fix_json_encoding()
        
        # 修复报告文件编码
        report_success = True
        if self.input_report_file and os.path.exists(self.input_report_file):
            report_success = self.fix_report_encoding()
        elif self.input_report_file:
            print(f"警告: 找不到{self.type}报告文件 {self.input_report_file}")
        
        # 总结修复结果
        if json_success and report_success:
            print(f"\n=== {self.type}编码修复完成 ===")
            print(f"1. 修复后的{self.type}数据文件: {self.output_json_file}")
            if self.output_report_file:
                print(f"2. 修复后的{self.type}过滤报告文件: {self.output_report_file}")
            print("提示: 现在可以使用修复后的文件进行选股分析")
            return True
        else:
            print(f"\n=== {self.type}编码修复失败 ===")
            return False

# 修复编码的主要函数
def fix_encoding(file_path=None, is_a_stock=False):
    """支持A股和通用编码修复的主函数
    
    Args:
        file_path: 可选，指定要修复的文件路径
        is_a_stock: 是否为A股数据
    """
    
    # 创建编码修复器实例
    fixer = EncodingFixer(is_a_stock)
    
    # 如果指定了文件路径，覆盖默认设置
    if file_path:
        fixer.input_json_file = file_path
        # 生成输出文件路径
        base_name = os.path.basename(file_path)
        name_without_ext = os.path.splitext(base_name)[0]
        ext = os.path.splitext(base_name)[1]
        fixer.output_json_file = os.path.join(
            os.path.dirname(file_path),
            f"{name_without_ext}_fixed{ext}"
        )
    
    # 运行修复
    return fixer.run()

# 主程序入口
if __name__ == "__main__":
    # 首先修复A股数据
    a_stock_success = fix_encoding(is_a_stock=True)
    
    # 然后修复通用数据
    general_success = fix_encoding(is_a_stock=False)
    
    # 总结
    if a_stock_success and general_success:
        print("\n=== 所有数据编码修复成功 ===")
        sys.exit(0)
    else:
        print("\n=== 部分数据编码修复失败 ===")
        sys.exit(1)