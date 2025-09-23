import sys
import os
import json
import re
from datetime import datetime

# 设置Windows编码
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

class StockFilter:
    def __init__(self):
        # A股股票代码正则表达式模式
        self.a_stock_patterns = [
            r'^60[013]\d{3}\.SH$',  # 沪市主板/科创板/创业板：600xxx.SH, 601xxx.SH, 603xxx.SH
            r'^00[012]\d{3}\.SZ$',  # 深市主板/中小板：000xxx.SZ, 001xxx.SZ, 002xxx.SZ
            r'^300\d{3}\.SZ$'       # 深市创业板：300xxx.SZ
        ]
        
        # 非A股特征
        self.non_a_stock_keywords = [
            'ETF', '指数', '基金', '债券'
        ]
        
    def is_a_stock(self, stock):
        """判断一只股票是否为A股"""
        code = stock.get('code', '')
        name = stock.get('name', '')
        industry = stock.get('industry', '')
        
        # 检查股票代码是否符合A股格式
        for pattern in self.a_stock_patterns:
            if re.match(pattern, code):
                # 进一步排除名称和代码相同的非A股
                if name and name != code:
                    # 检查行业是否包含非A股关键词
                    if not any(keyword in industry for keyword in self.non_a_stock_keywords):
                        return True
        
        return False

    def filter_a_stocks(self, input_file, output_file):
        """过滤A股股票数据并保存到新文件"""
        try:
            # 读取输入文件
            print(f"正在读取数据文件: {input_file}")
            with open(input_file, 'r', encoding='utf-8') as f:
                all_stocks = json.load(f)
            
            total_count = len(all_stocks)
            print(f"成功读取 {total_count} 条股票数据")
            
            # 过滤A股股票
            print("开始过滤A股股票...")
            a_stocks = [stock for stock in all_stocks if self.is_a_stock(stock)]
            a_stock_count = len(a_stocks)
            
            # 统计过滤前后的数据量
            filtered_count = total_count - a_stock_count
            
            # 保存过滤后的A股数据
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(a_stocks, f, ensure_ascii=False, indent=2)
            
            print(f"过滤完成！成功筛选出 {a_stock_count} 条A股股票数据")
            print(f"过滤掉 {filtered_count} 条非A股股票数据")
            print(f"A股数据已保存至: {output_file}")
            
            # 生成过滤报告
            self.generate_filter_report(input_file, output_file, total_count, a_stock_count, filtered_count)
            
        except Exception as e:
            print(f"处理过程中发生错误: {str(e)}")
            sys.exit(1)
    
    def generate_filter_report(self, input_file, output_file, total_count, a_stock_count, filtered_count):
        """生成过滤报告"""
        report_file = output_file.replace('.json', '_filter_report.txt')
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("===== A股股票数据过滤报告 =====\n\n")
            f.write(f"过滤时间: {self.get_current_time()}\n")
            f.write(f"输入文件: {input_file}\n")
            f.write(f"输出文件: {output_file}\n\n")
            f.write(f"原始数据总量: {total_count} 条\n")
            f.write(f"过滤后A股数量: {a_stock_count} 条\n")
            f.write(f"过滤掉的非A股数量: {filtered_count} 条\n\n")
            f.write(f"A股占比: {a_stock_count / total_count * 100:.2f}%\n\n")
            f.write("===== 过滤规则说明 =====\n\n")
            f.write("1. 保留的A股股票代码格式:\n")
            f.write("   - 沪市主板/科创板: 600xxx.SH, 601xxx.SH, 603xxx.SH\n")
            f.write("   - 深市主板/中小板: 000xxx.SZ, 001xxx.SZ, 002xxx.SZ\n")
            f.write("   - 深市创业板: 300xxx.SZ\n\n")
            f.write("2. 排除条件:\n")
            f.write("   - 名称与代码相同的股票\n")
            f.write(f"   - 行业包含以下关键词的股票: {', '.join(self.non_a_stock_keywords)}\n")
        
        print(f"过滤报告已生成: {report_file}")
    
    def get_current_time(self):
        """获取当前时间"""
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

if __name__ == "__main__":
    print("=== A股股票数据过滤工具 ===")
    
    # 设置文件路径
    base_dir = os.path.dirname(__file__)
    input_file = os.path.join(base_dir, 'data', 'processed', 'stock_data_fixed.json')
    output_file = os.path.join(base_dir, 'data', 'processed', 'stock_data_a_shares.json')
    
    # 创建过滤器并执行过滤
    stock_filter = StockFilter()
    stock_filter.filter_a_stocks(input_file, output_file)
    
    print("\n=== 过滤任务完成 ===")
    print("提示：")
    print("1. 过滤后的A股数据可用于选股分析")
    print("2. 请查看过滤报告了解详细的过滤情况")
    print("3. 如需调整过滤规则，请修改本脚本中的过滤条件")