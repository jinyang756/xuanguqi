# 此脚本用于整合Tushare数据和免费替代数据源的数据，生成完整的stock_data.json文件

import pandas as pd
import json
import os
from datetime import datetime

class StockDataIntegrator:
    def __init__(self):
        # 输入文件路径
        self.tushare_stock_list = 'data/stock_list.csv'
        self.tushare_daily_dir = 'data/daily'
        self.free_data_file = 'data/free_stock_data.json'
        
        # 输出文件路径
        self.output_file = 'stock_data.json'
        
        # 默认行业信息映射（作为最后的备选）
        self.default_industry_mapping = {
            '600519.SH': '酿酒行业',
            '000858.SZ': '酿酒行业',
            '000333.SZ': '家电行业',
            '000651.SZ': '家电行业',
            '002415.SZ': '电子元件',
            '600900.SH': '电力行业',
            '601318.SH': '保险行业',
            '601888.SH': '旅游酒店',
            '600276.SH': '医药制造',
            '000001.SZ': '银行行业'
        }
    
    def load_tushare_stock_list(self):
        """加载Tushare获取的股票列表"""
        if not os.path.exists(self.tushare_stock_list):
            print(f"错误：Tushare股票列表文件{self.tushare_stock_list}不存在")
            return None
        
        try:
            df = pd.read_csv(self.tushare_stock_list)
            print(f"成功加载Tushare股票列表，包含{len(df)}只股票")
            return df
        except Exception as e:
            print(f"加载Tushare股票列表失败：{str(e)}")
            return None
    
    def load_tushare_daily_data(self, stock_code):
        """加载Tushare获取的单只股票日线数据"""
        file_name = f"{stock_code.replace('.', '_')}_daily.csv"
        file_path = os.path.join(self.tushare_daily_dir, file_name)
        
        if not os.path.exists(file_path):
            print(f"警告：{stock_code}的Tushare日线数据文件不存在")
            return None
        
        try:
            df = pd.read_csv(file_path)
            # 按交易日期排序（最新的在前）
            df['trade_date'] = pd.to_datetime(df['trade_date'])
            df = df.sort_values('trade_date', ascending=False)
            return df
        except Exception as e:
            print(f"加载{stock_code}的Tushare日线数据失败：{str(e)}")
            return None
    
    def load_free_stock_data(self):
        """加载从免费数据源获取的股票数据"""
        if not os.path.exists(self.free_data_file):
            print(f"警告：免费数据源文件{self.free_data_file}不存在")
            return {}
        
        try:
            with open(self.free_data_file, 'r', encoding='utf-8') as f:
                free_data = json.load(f)
                # 转换为字典，方便查找
                return {item['full_code']: item for item in free_data}
        except Exception as e:
            print(f"加载免费数据源失败：{str(e)}")
            return {}
    
    def integrate_stock_data(self, stock_info, daily_df, free_data):
        """整合单只股票的数据"""
        stock_code = stock_info['ts_code']
        stock_name = stock_info['name']
        
        # 初始化整合后的股票数据
        integrated_data = {
            'code': stock_code,
            'name': stock_name,
            'industry': '未知',
            'price': 0,
            'priceChange': 0,
            'changePercent': 0,
            'pe': 0,
            'roe': 0,
            'turnoverRate': 0,
            'volume': 0,
            'amount': 0,
            'marketCap': 0
        }
        
        # 从Tushare日线数据中获取价格、涨跌幅、成交量等基础字段
        if daily_df is not None and not daily_df.empty:
            latest_data = daily_df.iloc[0]
            
            integrated_data['price'] = float(latest_data['close'])
            integrated_data['priceChange'] = float(latest_data['pct_chg'] if 'pct_chg' in latest_data else 0)
            integrated_data['changePercent'] = float(latest_data['pct_chg'] if 'pct_chg' in latest_data else 0)
            integrated_data['volume'] = float(latest_data['vol'] if 'vol' in latest_data else 0)
        
        # 从免费数据源中获取行业信息和其他指标
        if stock_code in free_data:
            free_stock_data = free_data[stock_code]
            
            # 优先使用免费数据源的行业信息
            if free_stock_data.get('industry') != '未知':
                integrated_data['industry'] = free_stock_data['industry']
            
            # 获取其他指标
            if 'pe' in free_stock_data and free_stock_data['pe'] > 0:
                integrated_data['pe'] = float(free_stock_data['pe'])
            
            if 'pb' in free_stock_data and free_stock_data['pb'] > 0:
                integrated_data['pb'] = float(free_stock_data['pb'])
            
            if 'roe' in free_stock_data and free_stock_data['roe'] > 0:
                integrated_data['roe'] = float(free_stock_data['roe'])
            
            if 'turnover_rate' in free_stock_data and free_stock_data['turnover_rate'] > 0:
                integrated_data['turnoverRate'] = float(free_stock_data['turnover_rate'])
            
            if 'market_cap' in free_stock_data and free_stock_data['market_cap'] > 0:
                integrated_data['marketCap'] = float(free_stock_data['market_cap'])
        
        # 如果行业信息仍然是未知，尝试使用默认行业映射
        if integrated_data['industry'] == '未知' and stock_code in self.default_industry_mapping:
            integrated_data['industry'] = self.default_industry_mapping[stock_code]
        
        return integrated_data
    
    def integrate_all_stocks(self):
        """整合所有股票的数据并生成stock_data.json文件"""
        # 加载Tushare股票列表
        stock_list_df = self.load_tushare_stock_list()
        if stock_list_df is None:
            return False
        
        # 加载免费数据源的数据
        free_data = self.load_free_stock_data()
        
        # 处理每只股票
        stock_data_list = []
        success_count = 0
        
        for _, row in stock_list_df.iterrows():
            stock_code = row['ts_code']
            stock_name = row['name']
            
            print(f"整合股票：{stock_name}({stock_code})")
            
            # 加载Tushare日线数据
            daily_df = self.load_tushare_daily_data(stock_code)
            
            # 整合数据
            integrated_data = self.integrate_stock_data(row, daily_df, free_data)
            
            if integrated_data:
                # 添加到结果列表
                stock_data_list.append(integrated_data)
                success_count += 1
                
                # 打印整合结果摘要
                print(f"  价格：{integrated_data['price']}，行业：{integrated_data['industry']}")
        
        # 保存为JSON文件
        try:
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(stock_data_list, f, ensure_ascii=False, indent=2)
            
            print(f"\n数据整合完成！")
            print(f"成功整合了{success_count}只股票的数据")
            print(f"数据已保存到：{self.output_file}")
            
            # 统计整合后的数据质量
            self.report_data_quality(stock_data_list)
            
            return True
        except Exception as e:
            print(f"保存整合数据失败：{str(e)}")
            return False
    
    def report_data_quality(self, stock_data_list):
        """报告整合后的数据质量"""
        print("\n===== 数据质量报告 =====")
        
        # 统计已知行业的股票数量
        known_industry_count = sum(1 for stock in stock_data_list if stock['industry'] != '未知')
        industry_coverage = known_industry_count / len(stock_data_list) * 100 if stock_data_list else 0
        print(f"行业信息覆盖率：{known_industry_count}/{len(stock_data_list)} ({industry_coverage:.1f}%)")
        
        # 统计有价格数据的股票数量
        price_available_count = sum(1 for stock in stock_data_list if stock['price'] > 0)
        price_coverage = price_available_count / len(stock_data_list) * 100 if stock_data_list else 0
        print(f"价格数据覆盖率：{price_available_count}/{len(stock_data_list)} ({price_coverage:.1f}%)")
        
        # 统计有涨跌幅数据的股票数量
        change_available_count = sum(1 for stock in stock_data_list if stock['changePercent'] != 0)
        change_coverage = change_available_count / len(stock_data_list) * 100 if stock_data_list else 0
        print(f"涨跌幅数据覆盖率：{change_available_count}/{len(stock_data_list)} ({change_coverage:.1f}%)")
        
        # 统计有成交量数据的股票数量
        volume_available_count = sum(1 for stock in stock_data_list if stock['volume'] > 0)
        volume_coverage = volume_available_count / len(stock_data_list) * 100 if stock_data_list else 0
        print(f"成交量数据覆盖率：{volume_available_count}/{len(stock_data_list)} ({volume_coverage:.1f}%)")
        
        print("=====================")

# 主函数，用于运行数据整合
if __name__ == "__main__":
    print("===== 股票数据整合开始 =====")
    
    integrator = StockDataIntegrator()
    success = integrator.integrate_all_stocks()
    
    if success:
        print("\n===== 数据整合总结 =====")
        print("1. 已成功整合Tushare基础数据和免费替代数据源的数据")
        print("2. 生成的stock_data.json文件包含以下特点：")
        print("   - 优先使用Tushare的价格、涨跌幅、成交量等基础字段")
        print("   - 使用免费数据源补充行业信息和其他高级指标")
        print("   - 为无法获取数据的字段提供了合理的默认值")
        print("3. 数据可直接用于选股器前端展示和选股功能")
    else:
        print("数据整合失败，请检查错误信息")
        
    print("\n===== 股票数据整合结束 =====")