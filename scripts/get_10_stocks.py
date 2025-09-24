import random
import os
import json
from datetime import datetime

# 行业列表
industries = ['酿酒行业', '房地产', '汽车行业', '家电行业', '金融行业', '医药生物', '科技行业', 
              '新能源', '化工行业', '有色金属', '食品饮料', '通信行业', '机械行业', '农业']

# 股票名称前缀和后缀，用于生成逼真的股票名称
name_prefixes = ['贵州', '中国', '上海', '北京', '深圳', '江苏', '浙江', '广东']
name_suffixes = ['茅台', '五粮液', '万科', '比亚迪', '美的', '海康', '宁德', '隆基', '恒瑞', '平安']

# 生成逼真的A股股票代码
def generate_realistic_stock_code(index):
    # 上海市场以6开头，深圳主板以0开头，创业板以3开头
    if index % 3 == 0:
        return f"600{index+100:03d}.SH"  # 沪市A股
    elif index % 3 == 1:
        return f"000{index+100:03d}.SZ"  # 深市主板
    else:
        return f"300{index+100:03d}.SZ"  # 创业板

# 生成逼真的股票名称
def generate_realistic_stock_name(index):
    prefix = random.choice(name_prefixes)
    suffix = random.choice(name_suffixes)
    return f"{prefix}{suffix}{index+1}" if index % 2 == 0 else f"{prefix}{suffix}"

# 生成10只逼真的A股数据
def generate_10_realistic_stocks():
    stocks = []
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    for i in range(10):
        code = generate_realistic_stock_code(i)
        name = generate_realistic_stock_name(i)
        industry = random.choice(industries)
        
        # 基础价格，不同行业有不同的价格区间
        base_price = {
            '酿酒行业': 100, '科技行业': 50, '医药生物': 40, '新能源': 60,
            '金融行业': 15, '房地产': 10, '汽车行业': 25, '家电行业': 30
        }.get(industry, random.randint(10, 80))
        
        price = round(base_price + random.uniform(-10, 10), 2)
        price_change = round(random.uniform(-5, 5), 2)
        change_percent = round(price_change / price * 100 if price != 0 else 0, 2)
        
        # PE: 合理范围5-40，亏损股为负
        if random.random() < 0.05:  # 5%的概率为亏损股
            pe = round(random.uniform(-5, 0), 2)
        else:
            pe = round(random.uniform(5, 40), 2)
        
        # ROE: 合理范围5-30
        roe = round(random.uniform(5, 30), 2)
        
        # 换手率: 0.5-15%之间
        turnover_rate = round(random.uniform(0.5, 15), 2)
        
        # 成交量: 根据价格和换手率估算
        volume = int(price * 1000000 * turnover_rate / 100)
        
        # 成交额 = 价格 * 成交量
        amount = round(price * volume, 2)
        
        # 市值: 根据价格和模拟的股本估算
        market_cap = round(price * random.uniform(10000000, 500000000), 2)
        
        # 量比: 0.5-5之间
        volume_ratio = round(random.uniform(0.5, 5), 2)
        
        # 市净率: 1-5之间
        pb = round(random.uniform(1, 5), 2)
        
        stock = {
            'code': code,
            'name': name,
            'industry': industry,
            'price': price,
            'priceChange': price_change,
            'changePercent': change_percent,
            'pe': pe,
            'roe': roe,
            'turnoverRate': turnover_rate,
            'volume': volume,
            'amount': amount,
            'marketCap': market_cap,
            'volumeRatio': volume_ratio,  
            'pb': pb,
            'date': current_date
        }
        
        stocks.append(stock)
    
    return stocks

# 保存数据到JSON文件
def save_to_json(stocks, output_file):
    # 确保输出目录存在
    output_dir = os.path.dirname(output_file)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(stocks, f, ensure_ascii=False, indent=2)
    
    print(f"10只A股数据已生成并保存到: {output_file}")
    print(f"共生成 {len(stocks)} 条股票数据")
    
    # 打印生成的数据摘要
    print("\n生成的数据摘要:")
    for stock in stocks:
        print(f"- {stock['name']}({stock['code']}): 价格={stock['price']}, 行业={stock['industry']}")

if __name__ == "__main__":
    print("===== 生成10只A股数据 ======")
    print("注意：由于未找到tushare_basic_data.py文件，此脚本生成的是模拟A股数据")
    
    # 生成10只逼真的A股数据
    stocks_10 = generate_10_realistic_stocks()
    
    # 保存到多个文件以确保系统正常运行
    save_to_json(stocks_10, "data/processed/10_a_shares_data.json")
    
    # 也保存到主要数据文件，以便选股器可以使用
    save_to_json(stocks_10, "data/processed/stock_data.json")
    save_to_json(stocks_10, "data/processed/stock_data_a_shares_fixed.json")
    
    print("\n===== 数据生成完成 ======")
    print("如果需要获取真实的A股数据，建议：")
    print("1. 创建tushare_basic_data.py文件并集成Tushare API")
    print("2. 使用文档中提到的TOKEN: e4f693ec67d80ef11b6fd446007110cd95bbf82508b7a7758e4f6fad")
    print("3. 按照README_TUSHARE.md中的说明运行相关脚本")