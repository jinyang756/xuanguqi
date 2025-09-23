import sys
import os

# 添加backend目录到Python路径
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# 导入选股模块
from filtering.select_stock import load_stock_data, select_stock_for_short_term_growth, display_stock_info

# 测试不同的数据文件 - 使用绝对路径
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
data_files = [
    os.path.join(base_dir, 'data', 'processed', 'stock_data_a_shares_fixed.json'),  # 修复了中文编码的A股数据
    os.path.join(base_dir, 'data', 'processed', 'stock_data.json')          # 原始数据
]

def test_stock_selection():
    # 尝试不同的数据文件
    for file_path in data_files:
        print(f"\n尝试读取数据文件: {file_path}")
        
        # 检查文件是否存在
        if not os.path.exists(file_path):
            print(f"文件不存在: {file_path}")
            continue
        
        # 尝试加载股票数据
        try:
            stock_data = load_stock_data(file_path)
            if not stock_data:
                print(f"成功加载文件但数据为空: {file_path}")
            else:
                print(f"成功加载 {len(stock_data)} 条股票数据")
                
                # 尝试执行选股
                selected_stock = select_stock_for_short_term_growth(stock_data)
                if selected_stock:
                    print("成功选出一只股票")
                    # 显示选股结果（仅显示关键信息）
                    print(f"股票代码: {selected_stock.get('code', '未知')}")
                    print(f"股票名称: {selected_stock.get('name', '未知')}")
                    print(f"所属行业: {selected_stock.get('industry', '未知')}")
                    print(f"当前价格: ¥{float(selected_stock.get('price', 0)):.2f}")
                    print(f"涨跌幅: {float(selected_stock.get('priceChange', 0)):.2f}%")
                else:
                    print("未能选出合适的股票")
        except Exception as e:
            print(f"读取数据时出错: {str(e)}")
    
    # 检查数据文件的路径问题
    print("\n当前工作目录:", os.getcwd())
    print("data/processed目录内容:")
    processed_dir = os.path.join(os.path.dirname(__file__), 'data', 'processed')
    if os.path.exists(processed_dir):
        for file in os.listdir(processed_dir):
            print(f"- {file}")
    else:
        print(f"目录不存在: {processed_dir}")

if __name__ == "__main__":
    # 设置Windows编码
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    
    print("开始测试选股功能读取数据...")
    test_stock_selection()