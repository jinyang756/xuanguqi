import os
import json
import struct
import time
from datetime import datetime

# 定义股票名称和行业映射关系（简化版，实际项目中可以扩展）
STOCK_NAME_INDUSTRY_MAP = {
    '600519': {'name': '贵州茅台', 'industry': '酿酒行业'},
    '000858': {'name': '五粮液', 'industry': '酿酒行业'},
    '000002': {'name': '万科A', 'industry': '房地产'},
    '002594': {'name': '比亚迪', 'industry': '汽车行业'},
    '000333': {'name': '美的集团', 'industry': '家电行业'},
    '601888': {'name': '中国中免', 'industry': '旅游酒店'},
    '600900': {'name': '长江电力', 'industry': '电力行业'},
    '600036': {'name': '招商银行', 'industry': '银行'},
    '000001': {'name': '平安银行', 'industry': '银行'},
    '601318': {'name': '中国平安', 'industry': '保险'},
    '000725': {'name': '京东方A', 'industry': '电子元件'},
    '002415': {'name': '海康威视', 'industry': '电子元件'},
    '000538': {'name': '云南白药', 'industry': '医药制造'},
    '600276': {'name': '恒瑞医药', 'industry': '医药制造'},
    '600000': {'name': '浦发银行', 'industry': '银行'},
    '600030': {'name': '中信证券', 'industry': '证券'},
    '601166': {'name': '兴业银行', 'industry': '银行'},
    '002236': {'name': '大华股份', 'industry': '电子元件'},
    '000895': {'name': '双汇发展', 'industry': '食品饮料'},
    '000723': {'name': '美锦能源', 'industry': '煤炭采选'}
}


def parse_day_file(file_path):
    """解析单个.day文件，提取股票数据"""
    try:
        # 获取文件名作为股票代码（不包含后缀）
        stock_filename = os.path.basename(file_path).split('.')[0]

        # 判断市场类型：沪市(SH)和深市(SZ)
        market = 'SH' if stock_filename.startswith('sh') else 'SZ'
        code = (stock_filename[2:] if
                stock_filename.startswith('sh') or
                stock_filename.startswith('sz') else
                stock_filename)

        # 读取二进制文件
        with open(file_path, 'rb') as f:
            data = f.read()

        # 检查文件是否为空
        if len(data) == 0:
            print(f"警告: {stock_filename} 文件为空")
            return None

        # .day文件每32字节为一条记录
        record_size = 32
        num_records = len(data) // record_size

        if num_records == 0:
            print(f"警告: {stock_filename} 没有有效的数据记录")
            return None

        # 获取最新的记录（最后一条）
        latest_record = data[-record_size:]

        # 解析记录
        # 00-03: 年月日（整型）
        # 04-07: 开盘价*1000（整型）
        # 08-11: 最高价*1000（整型）
        # 12-15: 最低价*1000（整型）
        # 16-19: 收盘价*1000（整型）
        # 20-23: 成交额（元）（float）
        # 24-27: 成交量（手）（整型）
        # 28-31: 上日收盘价*1000（整型）

        # 使用struct.unpack解析二进制数据
        # < 表示小端字节序，i表示整型，f表示float
        unpack_result = struct.unpack('<iiiiifii', latest_record)
        # 分两行解包以符合行长度限制
        date_int, open_price_int = unpack_result[:2]
        high_price_int, low_price_int = unpack_result[2:4]
        close_price_int, amount, volume, prev_close_int = unpack_result[4:8]

        # 转换价格（除以1000）
        open_price = open_price_int / 1000.0
        high_price = high_price_int / 1000.0
        low_price = low_price_int / 1000.0
        close_price = close_price_int / 1000.0
        prev_close = prev_close_int / 1000.0

        # 计算涨跌幅
        price_change = close_price - prev_close
        change_percent = ((price_change / prev_close) * 100
                          if prev_close != 0 else 0)

        # 获取股票名称和行业
        stock_info = STOCK_NAME_INDUSTRY_MAP.get(
            code,
            {'name': f'{code}.{market}', 'industry': '未知行业'}
        )

        # 格式化日期
        date_str = str(date_int)
        if len(date_str) == 8:
            date = datetime.strptime(date_str, '%Y%m%d').strftime('%Y-%m-%d')
        else:
            date = '未知日期'

        # 构造股票数据对象
        stock_data = {
            "code": f"{code}.{market}",
            "name": stock_info['name'],
            "industry": stock_info['industry'],
            "price": round(float(close_price), 2),
            "priceChange": round(float(price_change), 2),
            "changePercent": round(float(change_percent), 2),
            "pe": 0,  # 市盈率，暂时设为0
            "roe": 0,  # 净资产收益率，暂时设为0
            "turnoverRate": 0,  # 换手率，暂时设为0
            "volume": float(volume),
            "amount": float(amount),
            "marketCap": 0,  # 市值，暂时设为0
            "date": date
        }

        return stock_data

    except Exception as e:
        print(f"解析文件 {file_path} 出错: {str(e)}")
        return None


def parse_all_day_files(lday_dir, output_file):
    """解析目录下所有的.day文件，并将结果写入JSON文件"""
    # 创建空的股票数据列表
    all_stocks = []

    # 检查lday目录是否存在
    if not os.path.exists(lday_dir):
        print(f"错误: 找不到lday目录 {lday_dir}")
        return

    # 获取lday目录下所有的.day文件
    day_files = [f for f in os.listdir(lday_dir) if f.endswith('.day')]
    total_files = len(day_files)

    print(f"找到 {total_files} 个.day文件需要解析")

    # 解析每个.day文件
    for i, day_file in enumerate(day_files, 1):
        file_path = os.path.join(lday_dir, day_file)

        # 显示进度
        if i % 10 == 0 or i == total_files:
            print(f"解析进度: {i}/{total_files} ({i/total_files*100:.1f}%)")

        # 解析文件
        stock_data = parse_day_file(file_path)

        # 如果解析成功，添加到列表中
        if stock_data:
            all_stocks.append(stock_data)

        # 避免处理过快
        if i % 50 == 0:
            time.sleep(0.1)

    # 如果已经有stock_data.json文件，读取现有数据
    existing_stocks = []
    if os.path.exists(output_file):
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                existing_stocks = json.load(f)
            print(f"成功读取 {len(existing_stocks)} 条现有股票数据")
        except Exception as e:
            print(f"读取现有股票数据出错: {str(e)}")

    # 合并新数据和现有数据（新数据优先）
    # 创建一个字典，以股票代码为键
    stock_dict = {stock['code']: stock for stock in existing_stocks}

    # 添加或更新新解析的数据
    for stock in all_stocks:
        stock_dict[stock['code']] = stock

    # 转换回列表
    merged_stocks = list(stock_dict.values())

    print(f"合并后共有 {len(merged_stocks)} 条股票数据")

    # 将结果写入JSON文件
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(merged_stocks, f, ensure_ascii=False, indent=2)
        print(f"成功将股票数据写入 {output_file}")
    except Exception as e:
        print(f"写入股票数据出错: {str(e)}")


def main():
    """主函数"""
    # 解析lday目录下的所有.day文件
    # 定义沪市和深市数据目录
    sh_lday_dir = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        '..', 'data', 'original', 'lday', 'sh', 'lday'
    )
    sz_lday_dir = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        '..', 'data', 'original', 'lday', 'sz', 'lday'
    )
    output_file = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        '..', 'data', 'processed', 'stock_data.json'
    )

    # 创建一个临时列表用于存储所有解析的数据
    all_parsed_stocks = []

    # 检查并处理沪市数据
    if os.path.exists(sh_lday_dir):
        print("开始解析沪市A股日线数据...")
        # 先创建临时文件用于沪市数据
        sh_temp_file = output_file + '.sh.temp'
        parse_all_day_files(sh_lday_dir, sh_temp_file)

        # 如果临时文件存在，读取沪市数据
        if os.path.exists(sh_temp_file):
            try:
                with open(sh_temp_file, 'r', encoding='utf-8') as f:
                    sh_stocks = json.load(f)
                all_parsed_stocks.extend(sh_stocks)
                os.remove(sh_temp_file)  # 删除临时文件
            except Exception as e:
                print(f"读取沪市临时数据出错: {str(e)}")
    else:
        print(f"警告: 找不到沪市A股日线数据目录 {sh_lday_dir}")

    # 检查并处理深市数据（独立处理，不依赖沪市结果）
    if os.path.exists(sz_lday_dir):
        print("\n开始解析深市A股日线数据...")
        # 创建临时文件用于深市数据
        sz_temp_file = output_file + '.sz.temp'
        parse_all_day_files(sz_lday_dir, sz_temp_file)

        # 如果临时文件存在，读取深市数据
        if os.path.exists(sz_temp_file):
            try:
                with open(sz_temp_file, 'r', encoding='utf-8') as f:
                    sz_stocks = json.load(f)
                all_parsed_stocks.extend(sz_stocks)
                os.remove(sz_temp_file)  # 删除临时文件
            except Exception as e:
                print(f"读取深市临时数据出错: {str(e)}")
    else:
        print(f"警告: 找不到深市A股日线数据目录 {sz_lday_dir}")

    # 如果没有找到沪市和深市的标准目录，尝试直接在lday目录下查找
    if len(all_parsed_stocks) == 0:
        direct_lday_dir = os.path.join(os.getcwd(), 'lday')
        if os.path.exists(direct_lday_dir):
            print("\n尝试直接在lday目录下解析.day文件...")
            parse_all_day_files(direct_lday_dir, output_file)
        else:
            print(f"错误: 找不到lday目录 {direct_lday_dir}")
    else:
        # 合并所有解析的数据并去重
        stock_dict = {}
        for stock in all_parsed_stocks:
            stock_dict[stock['code']] = stock

        merged_stocks = list(stock_dict.values())
        print(f"\n合并后共有 {len(merged_stocks)} 条股票数据")

        # 将结果写入最终的JSON文件
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(merged_stocks, f, ensure_ascii=False, indent=2)
            print(f"成功将合并后的股票数据写入 {output_file}")
        except Exception as e:
            print(f"写入股票数据出错: {str(e)}")


if __name__ == '__main__':
    main()
