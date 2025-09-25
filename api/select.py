import json
import akshare as ak
import pandas as pd
import re

class SimpleStockSelector:
    def __init__(self):
        self.results = []
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
        
    def calculate_technical_indicators(self, df):
        df['MA5'] = df['close'].rolling(window=5).mean()
        df['MA20'] = df['close'].rolling(window=20).mean()
        df['MA60'] = df['close'].rolling(window=60).mean()
        df['VOLUME_MA5'] = df['volume'].rolling(window=5).mean()
        df['VOLUME_MA20'] = df['volume'].rolling(window=20).mean()
        df['UPPER_BAND'] = df['high'].rolling(window=20).max()
        df['LOWER_BAND'] = df['low'].rolling(window=20).min()
        df['CHANGE'] = df['close'].pct_change()
        return df.dropna()
    
    def breakout_strategy(self, stock_code, df):
        if len(df) < 60:
            return None
        latest = df.iloc[-1]
        condition_volume = latest['volume'] > latest['VOLUME_MA20'] * 2
        condition_breakout = latest['close'] > latest['UPPER_BAND']
        condition_trend = (latest['MA5'] > latest['MA20'] and latest['MA20'] > latest['MA60'])
        condition_stable = latest['close'] > latest['open']
        if condition_volume and condition_breakout and condition_trend and condition_stable:
            volume_ratio = latest['volume'] / latest['VOLUME_MA20']
            breakout_strength = (latest['close'] - latest['UPPER_BAND']) / latest['UPPER_BAND'] * 100
            return {
                'stock_code': stock_code,
                'signal_date': str(latest.name),
                'close_price': float(latest['close']),
                'breakout_level': float(latest['UPPER_BAND']),
                'volume_ratio': round(volume_ratio, 2),
                'breakout_strength': round(breakout_strength, 2),
                'score': round(volume_ratio + breakout_strength, 2)
            }
        return None
    
    # 计算归一化因子
    def normalize(self, values):
        min_val = min(values)
        max_val = max(values)
        range_val = max_val - min_val if max_val != min_val else 1
        return [(v - min_val) / range_val for v in values]
    
    def validate_params(self, params):
        """验证选股参数"""
        if not isinstance(params, dict):
            return False, "参数必须是字典格式"
            
        # 验证日期格式
        if 'start_date' in params and params['start_date']:
            if not isinstance(params['start_date'], str) or len(params['start_date']) != 8:
                return False, "开始日期格式不正确，应为YYYYMMDD格式"
        
        if 'end_date' in params and params['end_date']:
            if not isinstance(params['end_date'], str) or len(params['end_date']) != 8:
                return False, "结束日期格式不正确，应为YYYYMMDD格式"
        
        # 验证数值参数
        numeric_params = [
            'price_min', 'price_max', 'market_cap_min', 'market_cap_max',
            'volume_min', 'volume_max', 'turnover_rate_min', 'turnover_rate_max',
            'pe_min', 'pe_max', 'pb_min', 'pb_max', 'roe_min', 'roe_max'
        ]
        
        for param in numeric_params:
            if param in params and params[param] is not None:
                try:
                    float_value = float(params[param])
                    if float_value < 0:
                        return False, f"{param}不能为负数"
                except (ValueError, TypeError):
                    return False, f"{param}必须是有效数字"
        
        # 验证布尔参数
        boolean_params = ['use_breakout_strategy', 'use_volume_strategy']
        for param in boolean_params:
            if param in params and params[param] is not None:
                if not isinstance(params[param], bool):
                    return False, f"{param}必须是布尔值"
        
        return True, "验证通过"

    # 基于短期上涨潜力选出单只股票
    def select_stock_for_short_term_growth(self, stock_data):
        # 筛选出信息齐全的股票
        valid_stocks = []
        for stock in stock_data:
            try:
                # 确保基本信息不为空或有效
                has_valid_info = (stock.get('name') and stock.get('name') != '未知股票' and \
                                stock.get('industry') and stock.get('industry') != '未知' and
                                float(stock.get('price', 0)) > 0 and
                                isinstance(stock.get('priceChange'), (int, float)) and
                                isinstance(stock.get('pe'), (int, float)) and float(stock.get('pe', 0)) > 0 and
                                isinstance(stock.get('roe'), (int, float)) and float(stock.get('roe', 0)) > 0 and
                                isinstance(stock.get('marketCap'), (int, float)) and float(stock.get('marketCap', 0)) > 0 and
                                isinstance(stock.get('volume'), (int, float)) and float(stock.get('volume', 0)) > 0 and
                                isinstance(stock.get('turnoverRate'), (int, float)) and float(stock.get('turnoverRate', 0)) > 0 and
                                isinstance(stock.get('pb'), (int, float)) and float(stock.get('pb', 0)) > 0)
                if has_valid_info:
                    valid_stocks.append(stock)
            except (ValueError, TypeError):
                # 忽略数据格式错误的股票
                continue
        
        # 如果没有有效股票，返回默认值或使用原始数据排序
        if not valid_stocks:
            print('没有找到信息齐全的股票，使用所有可用数据排序')
            stocks_copy = stock_data.copy()
            stocks_copy.sort(key=lambda stock: float(stock.get('priceChange', 0)) * 0.4 + \
                         float(stock.get('turnoverRate', 0)) * 0.3 + \
                         float(stock.get('volume', 0)) * 0.3, 
                         reverse=True)
            return stocks_copy[0] if stocks_copy else None
        
        # 提取关键指标并归一化
        price_changes = [float(s['priceChange']) for s in valid_stocks]
        turnover_rates = [float(s['turnoverRate']) for s in valid_stocks]
        volumes = [float(s['volume']) / float(s['marketCap']) for s in valid_stocks]  # 成交量/市值
        pes = [float(s['pe']) for s in valid_stocks]
        roes = [float(s['roe']) for s in valid_stocks]
        
        norm_price = self.normalize(price_changes)
        norm_turnover = self.normalize(turnover_rates)
        norm_volume = self.normalize(volumes)
        norm_pe = [1 - v for v in self.normalize(pes)]  # PE低则得分高
        norm_roe = self.normalize(roes)
        
        # 计算综合评分（与前端一致：技术面70% + 基本面30%）
        for i, stock in enumerate(valid_stocks):
            technical_score = norm_price[i] * 0.4 + norm_turnover[i] * 0.3 + norm_volume[i] * 0.3
            fundamental_score = norm_pe[i] * 0.4 + norm_roe[i] * 0.6
            stock['score'] = technical_score * 0.7 + fundamental_score * 0.3
        
        # 按评分排序
        valid_stocks.sort(key=lambda x: x['score'], reverse=True)
        return valid_stocks[0] if valid_stocks else None
    
    def run_screening(self, data_dict):
        self.results = []
        for stock_code, df in data_dict.items():
            try:
                df_with_indicators = self.calculate_technical_indicators(df.copy())
                result = self.breakout_strategy(stock_code, df_with_indicators)
                if result:
                    self.results.append(result)
            except Exception as e:
                pass
        self.results.sort(key=lambda x: x['score'], reverse=True)
        # 只返回优选出的第一只个股
        return self.results[:1] if self.results else []

def handler(request):
    try:
        # 设置跨域头
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Content-Type": "application/json"
        }
        
        # 处理OPTIONS请求
        if request.get("method") == "OPTIONS":
            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({"message": "Preflight request successful"})
            }
        
        # 获取请求体或查询参数
        request_body = json.loads(request.get("body", "{}")) if request.get("body") else {}
        strategy = request_body.get("strategy", "breakout")
        
        selector = SimpleStockSelector()
        results = []
        
        if strategy == "short_term_growth":
            # 使用短期增长潜力选股策略
            try:
                # 获取A股实时数据（使用akshare的函数）
                stock_df = ak.stock_zh_a_spot_em()
                
                # 转换DataFrame为字典列表，并过滤A股股票
                stock_data = []
                for _, row in stock_df.iterrows():
                    try:
                        # 构建符合select_stock_for_short_term_growth方法要求的数据结构
                        stock_info = {
                            'code': str(row['代码']),
                            'name': str(row['名称']),
                            'price': float(row['最新价']) if pd.notna(row['最新价']) else 0,
                            'priceChange': float(row['涨跌幅']) if pd.notna(row['涨跌幅']) else 0,
                            'industry': '未知',  # 行业信息需要额外获取
                            'pe': float(row['市盈率-动态']) if pd.notna(row['市盈率-动态']) else 0,
                            'roe': 0,  # ROE需要额外获取
                            'marketCap': float(row['总市值']) * 100000000 if pd.notna(row['总市值']) else 0,
                            'volume': float(row['成交额']) if pd.notna(row['成交额']) else 0,
                            'turnoverRate': float(row['换手率']) if pd.notna(row['换手率']) else 0,
                            'pb': float(row['市净率']) if pd.notna(row['市净率']) else 0
                        }
                        
                        # 检查是否为A股股票
                        if selector.is_a_stock(stock_info):
                            stock_data.append(stock_info)
                    except (ValueError, TypeError) as e:
                        # 忽略数据格式错误的股票
                        continue
                
                print(f"已过滤出 {len(stock_data)} 支A股股票")
                
                # 选择最适合短期上涨的单只股票
                selected_stock = selector.select_stock_for_short_term_growth(stock_data)
                if selected_stock:
                    results = [selected_stock]
                
                print(f"短期增长潜力选股完成，选出 {len(results)} 支股票")
            except Exception as e:
                print(f"短期增长潜力选股失败: {str(e)}")
                # 如果获取实时数据失败，回退到使用历史数据的突破策略
                results = fallback_to_breakout_strategy()
        else:
            # 默认使用突破策略
            results = fallback_to_breakout_strategy()
        
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps(results, ensure_ascii=False)
        }
    except Exception as e:
        print(f"选股过程发生错误: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps({"error": str(e)}, ensure_ascii=False)
        }

def fallback_to_breakout_strategy():
    """当短期增长潜力选股失败时，回退到使用历史数据的突破策略"""
    try:
        # 示例：获取贵州茅台和五粮液的日线数据
        codes = ['sh600519', 'sz000858']
        data_dict = {}
        
        print(f"开始获取 {len(codes)} 支股票的历史数据")
        
        for code in codes:
            try:
                print(f"正在获取股票 {code} 的数据")
                df = ak.stock_zh_a_hist(symbol=code, period="daily", start_date="20230101")
                df = df.rename(columns={
                    '开盘': 'open',
                    '收盘': 'close',
                    '最高': 'high',
                    '最低': 'low',
                    '成交量': 'volume'
                })
                df.index = pd.to_datetime(df['日期'])
                data_dict[code] = df[['open', 'close', 'high', 'low', 'volume']]
                print(f"成功获取股票 {code} 的数据")
            except Exception as e:
                print(f"获取股票 {code} 的数据失败: {str(e)}")
        
        selector = SimpleStockSelector()
        results = selector.run_screening(data_dict)
        
        print(f"突破策略选股完成，共选出 {len(results)} 支符合条件的股票")
        return results
    except Exception as e:
        print(f"突破策略选股失败: {str(e)}")
        return []