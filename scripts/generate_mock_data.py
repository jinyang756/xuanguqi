import json
import random
import os
import json
from datetime import datetime, timedelta

# 行业列表
industries = ['酿酒行业', '房地产', '汽车行业', '家电行业', '金融行业', '医药生物', '科技行业', 
              '新能源', '化工行业', '有色金属', '食品饮料', '通信行业', '机械行业', '农业', 
              '纺织服装', '电子元件', '钢铁行业', '建材行业', '交通运输', '商业贸易']

# 股票名称前缀和后缀，用于生成逼真的股票名称
name_prefixes = ['贵州', '中国', '上海', '北京', '深圳', '江苏', '浙江', '广东', '山东', '福建', 
                 '四川', '湖南', '湖北', '安徽', '河北', '河南', '山西', '陕西', '云南', '贵州']
name_suffixes = ['茅台', '五粮液', '万科', '比亚迪', '美的', '海康', '宁德', '隆基', '恒瑞', '平安', 
                 '茅台', '白药', '伊利', '海尔', '格力', '腾讯', '阿里', '华为', '小米', '京东', 
                 '科技', '发展', '实业', '集团', '控股', '股份', '银行', '证券', '保险', '重工']

# 生成随机股票代码
def generate_stock_code(index):
    # 上海市场以6开头，深圳市场以0或3开头
    if index % 3 == 0:
        return f"600{index:03d}.SH"
    elif index % 3 == 1:
        return f"000{index:03d}.SZ"
    else:
        return f"300{index:03d}.SZ"

# 生成随机股票名称
def generate_stock_name(index):
    prefix = random.choice(name_prefixes)
    suffix = random.choice(name_suffixes)
    # 避免生成完全一样的名称
    return f"{prefix}{suffix}{index % 10}" if index % 5 == 0 else f"{prefix}{suffix}"

# 生成虚拟股票数据
def generate_mock_stock_data(num_stocks=100):
    stocks = []
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    for i in range(num_stocks):
        code = generate_stock_code(i + 1)
        name = generate_stock_name(i)
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
            'volumeRatio': volume_ratio,  # 额外字段，用于选股算法
            'pb': pb,  # 额外字段，用于风险评估
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
    
    print(f"虚拟股票数据已生成并保存到: {output_file}")
    print(f"共生成 {len(stocks)} 条股票数据")

# 生成特定用于测试选股策略的数据（包含一些明显符合条件的股票）
def generate_test_strategy_data():
    stocks = generate_mock_stock_data(80)  # 先生成80个普通股票
    
    # 再添加20个专门用于测试不同选股策略的股票
    test_stocks = []
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    # 短期上涨潜力高的股票
    for i in range(5):
        test_stocks.append({
            'code': f"68800{i+1}.SH",
            'name': f"潜力股{i+1}",
            'industry': random.choice(industries),
            'price': round(random.uniform(20, 50), 2),
            'priceChange': round(random.uniform(1, 3), 2),
            'changePercent': round(random.uniform(3, 8), 2),
            'pe': round(random.uniform(10, 20), 2),
            'roe': round(random.uniform(15, 30), 2),
            'turnoverRate': round(random.uniform(2, 8), 2),
            'volume': int(random.uniform(5000000, 20000000)),
            'amount': round(random.uniform(100000000, 500000000), 2),
            'marketCap': round(random.uniform(1000000000, 5000000000), 2),
            'volumeRatio': round(random.uniform(1.5, 3), 2),
            'pb': round(random.uniform(2, 4), 2),
            'date': current_date
        })
    
    # 突破型股票
    for i in range(5):
        test_stocks.append({
            'code': f"30090{i+1}.SZ",
            'name': f"突破股{i+1}",
            'industry': random.choice(industries),
            'price': round(random.uniform(15, 40), 2),
            'priceChange': round(random.uniform(2, 5), 2),
            'changePercent': round(random.uniform(5, 10), 2),
            'pe': round(random.uniform(15, 25), 2),
            'roe': round(random.uniform(10, 25), 2),
            'turnoverRate': round(random.uniform(5, 15), 2),
            'volume': int(random.uniform(10000000, 30000000)),
            'amount': round(random.uniform(200000000, 800000000), 2),
            'marketCap': round(random.uniform(800000000, 4000000000), 2),
            'volumeRatio': round(random.uniform(2, 5), 2),  # 高量比，表示突破
            'pb': round(random.uniform(1.5, 3.5), 2),
            'date': current_date
        })
    
    # 各行业的代表性股票
    industry_representatives = []
    selected_industries = random.sample(industries, 10)
    for i, industry in enumerate(selected_industries):
        industry_representatives.append({
            'code': f"00100{i+1}.SZ",
            'name': f"{industry}代表{i+1}",
            'industry': industry,
            'price': round(random.uniform(10, 60), 2),
            'priceChange': round(random.uniform(-2, 2), 2),
            'changePercent': round(random.uniform(-3, 3), 2),
            'pe': round(random.uniform(8, 30), 2),
            'roe': round(random.uniform(8, 25), 2),
            'turnoverRate': round(random.uniform(1, 8), 2),
            'volume': int(random.uniform(3000000, 15000000)),
            'amount': round(random.uniform(50000000, 400000000), 2),
            'marketCap': round(random.uniform(500000000, 3000000000), 2),
            'volumeRatio': round(random.uniform(0.8, 2), 2),
            'pb': round(random.uniform(1.2, 4), 2),
            'date': current_date
        })
    
    # 合并所有股票
    all_stocks = stocks + test_stocks + industry_representatives
    random.shuffle(all_stocks)  # 打乱顺序
    
    return all_stocks

if __name__ == "__main__":
    # 生成普通虚拟数据
    mock_stocks = generate_mock_stock_data(100)
    save_to_json(mock_stocks, "data/processed/stock_data_mock.json")
    
    # 生成用于测试选股策略的虚拟数据
    strategy_test_stocks = generate_test_strategy_data()
    save_to_json(strategy_test_stocks, "data/processed/stock_data_strategy_test.json")
    
    # 也生成与原有文件名相同的数据，方便直接替换使用
    save_to_json(strategy_test_stocks, "data/processed/stock_data.json")
    save_to_json(strategy_test_stocks, "data/processed/stock_data_a_shares_fixed.json")