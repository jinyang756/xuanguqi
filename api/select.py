import json
import akshare as ak
import pandas as pd
import json

class SimpleStockSelector:
    def __init__(self):
        self.results = []
    
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
        return self.results

def handler(request):
    try:
        # 示例：获取贵州茅台和五粮液的日线数据
        codes = ['sh600519', 'sz000858']
        data_dict = {}
        
        print(f"开始获取 {len(codes)} 支股票的数据")
        
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
        
        print(f"选股完成，共选出 {len(results)} 支符合条件的股票")
        
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(results, ensure_ascii=False)
        }
    except Exception as e:
        print(f"选股过程发生错误: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}, ensure_ascii=False)
        }