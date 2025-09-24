#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tushare零积分接口数据获取脚本
使用Tushare API获取基础股票数据，并保存为选股器所需的格式
"""

import tushare as ts
import pandas as pd
import os
import json
from datetime import datetime, timedelta
import time
import random

# 设置Tushare API Token
TOKEN = 'e4f693ec67d80ef11b6fd446007110cd95bbf82508b7a7758e4f6fad'

# 初始化Tushare
ts.set_token(TOKEN)
pro = ts.pro_api()

# 数据目录设置
data_dir = 'data'
daily_data_dir = os.path.join(data_dir, 'daily')
stock_list_file = os.path.join(data_dir, 'stock_list.csv')

# 创建数据目录
def create_data_directories():
    """创建数据存储目录"""
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        print(f"创建数据目录: {data_dir}")
    
    if not os.path.exists(daily_data_dir):
        os.makedirs(daily_data_dir)
        print(f"创建日线数据目录: {daily_data_dir}")

# 获取股票列表
def get_stock_list():
    """使用Tushare获取A股股票列表"""
    try:
        # 获取股票列表，包括沪深A股
        stock_basic = pro.stock_basic(
            exchange='', 
            list_status='L',  # L表示上市
            fields='ts_code,symbol,name,area,industry,market,list_date'
        )
        
        # 过滤掉不需要的市场类型（例如：北交所）
        # 只保留上证(A股)、深证(A股)、创业板、科创板
        valid_markets = ['主板', '创业板', '科创板']
        stock_basic = stock_basic[stock_basic['market'].isin(valid_markets)]
        
        print(f"成功获取股票列表，共{len(stock_basic)}只股票")
        
        # 保存股票列表
        stock_basic.to_csv(stock_list_file, index=False, encoding='utf-8')
        print(f"股票列表已保存到: {stock_list_file}")
        
        return stock_basic
    except Exception as e:
        print(f"获取股票列表失败: {str(e)}")
        # 如果失败，尝试加载已有的股票列表
        if os.path.exists(stock_list_file):
            print("尝试加载已有的股票列表...")
            try:
                return pd.read_csv(stock_list_file)
            except:
                print("加载已有股票列表失败")
        return None

# 获取单只股票的日线数据
def get_stock_daily_data(ts_code, start_date=None, end_date=None):
    """获取单只股票的日线数据"""
    try:
        # 如果没有指定日期范围，默认获取最近30天的数据
        if not end_date:
            end_date = datetime.now().strftime('%Y%m%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y%m%d')
        
        # 获取日线数据
        daily_data = pro.daily(ts_code=ts_code, start_date=start_date, end_date=end_date)
        
        # 按交易日期降序排序
        if not daily_data.empty:
            daily_data = daily_data.sort_values('trade_date', ascending=False)
        
        return daily_data
    except Exception as e:
        print(f"获取{ts_code}日线数据失败: {str(e)}")
        return None

# 保存日线数据
def save_daily_data(ts_code, daily_data):
    """保存股票的日线数据到CSV文件"""
    if daily_data is None or daily_data.empty:
        return False
    
    try:
        # 文件名格式：code_daily.csv
        file_name = f"{ts_code.replace('.', '_')}_daily.csv"
        file_path = os.path.join(daily_data_dir, file_name)
        
        # 保存数据
        daily_data.to_csv(file_path, index=False, encoding='utf-8')
        print(f"已保存{ts_code}的日线数据到: {file_path}")
        return True
    except Exception as e:
        print(f"保存{ts_code}日线数据失败: {str(e)}")
        return False

# 批量获取股票日线数据
def batch_get_daily_data(stock_basic, max_stocks=10):
    """批量获取股票的日线数据，限制每天获取的股票数量"""
    if stock_basic is None or stock_basic.empty:
        print("没有股票数据可处理")
        return
    
    # 随机选择一部分股票进行获取，避免每次都获取相同的股票
    sample_size = min(max_stocks, len(stock_basic))
    selected_stocks = stock_basic.sample(n=sample_size)
    
    success_count = 0
    
    for index, stock in selected_stocks.iterrows():
        ts_code = stock['ts_code']
        stock_name = stock['name']
        
        print(f"\n处理股票: {stock_name}({ts_code}) - {index+1}/{sample_size}")
        
        # 检查该股票的日线数据是否已经存在
        file_name = f"{ts_code.replace('.', '_')}_daily.csv"
        file_path = os.path.join(daily_data_dir, file_name)
        
        # 如果文件存在且不是空的，可以选择跳过
        # 这里设置为覆盖更新，获取最新数据
        # if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        #     print(f"{ts_code}的日线数据已存在，跳过")
        #     success_count += 1
        #     continue
        
        # 获取日线数据
        daily_data = get_stock_daily_data(ts_code)
        
        # 保存数据
        if daily_data is not None and not daily_data.empty:
            if save_daily_data(ts_code, daily_data):
                success_count += 1
        
        # 添加随机延迟，避免触发Tushare的访问频率限制
        delay = random.uniform(1, 3)  # 随机延迟1-3秒
        print(f"等待{delay:.2f}秒后继续...")
        time.sleep(delay)
    
    print(f"\n日线数据获取完成，成功{success_count}只，失败{sample_size - success_count}只")

# 生成简单的行业映射文件
def generate_industry_mapping(stock_basic):
    """生成行业映射文件，用于前端展示"""
    if stock_basic is None or stock_basic.empty:
        return
    
    try:
        industry_mapping = {}
        for _, stock in stock_basic.iterrows():
            industry_mapping[stock['ts_code']] = {
                'code': stock['ts_code'],
                'name': stock['name'],
                'industry': stock['industry'] if pd.notna(stock['industry']) else '未知',
                'area': stock['area'] if pd.notna(stock['area']) else '未知'
            }
        
        # 保存行业映射
        industry_file = os.path.join(data_dir, 'industry_mapping.json')
        with open(industry_file, 'w', encoding='utf-8') as f:
            json.dump(industry_mapping, f, ensure_ascii=False, indent=2)
        
        print(f"行业映射文件已保存到: {industry_file}")
    except Exception as e:
        print(f"生成行业映射文件失败: {str(e)}")

# 主函数
def main():
    print("===== Tushare基础数据获取开始 =====")
    
    # 创建数据目录
    create_data_directories()
    
    # 获取股票列表
    stock_basic = get_stock_list()
    
    if stock_basic is not None and not stock_basic.empty:
        # 批量获取日线数据（每天限制获取10只股票）
        batch_get_daily_data(stock_basic, max_stocks=10)
        
        # 生成行业映射文件
        generate_industry_mapping(stock_basic)
    
    print("\n===== Tushare基础数据获取结束 =====")
    print("\n下一步：运行process_tushare_data.py处理数据")
    print("\n数据说明：")
    print("1. 处理后的数据将只保存到一个文件中：data/processed/stock_data.json")
    print("2. Tushare API有调用频率限制，建议每天只运行一次此脚本")
    print("3. 免费用户限制：每分钟最多访问接口50次，每小时最多访问接口1次")
    print("4. 如需获取更多字段或更频繁的数据更新，建议升级Tushare账户")

if __name__ == "__main__":
    main()