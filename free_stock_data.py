# 此脚本用于从免费数据源（如新浪财经、东方财富网）获取数据，补充Tushare无法获取的字段

import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
import os
import time
from datetime import datetime

class FreeStockData:
    def __init__(self):
        # 设置请求头，模拟浏览器访问
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        }
        
        # 数据目录
        self.data_dir = 'data'
        self.free_data_file = os.path.join(self.data_dir, 'free_stock_data.json')
        
        # 创建数据目录
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def get_industry_from_sina(self, code):
        """从新浪财经获取股票的行业信息"""
        try:
            # 确保代码格式正确，深市股票需要补全前导零
            if len(code) < 6:
                code = code.zfill(6)
                print(f"补全股票代码为：{code}")
            
            # 判断股票类型并构建正确的URL
            if code.startswith('6'):
                # 沪市股票
                market = 'sh'
            elif code.startswith('0') or code.startswith('3'):
                # 深市股票（主板或创业板）
                market = 'sz'
            else:
                # 其他类型股票，返回未知
                print(f"未知股票类型，代码：{code}")
                return '未知'
            
            # 新浪财经的URL可能有变化，尝试不同的页面
            urls = [
                f"https://finance.sina.com.cn/realstock/company/{market}{code}/gsjs.html",  # 公司简介
                f"https://finance.sina.com.cn/realstock/company/{market}{code}/cjbg.html"   # 财务报告
            ]
            
            for url in urls:
                print(f"尝试从{url}获取行业信息")
                try:
                    # 发送请求，设置超时和重试
                    response = requests.get(url, headers=self.headers, timeout=10)
                    response.encoding = 'utf-8'
                    
                    # 检查响应状态
                    if response.status_code != 200:
                        print(f"请求失败，状态码：{response.status_code}")
                        continue
                    
                    # 检查页面是否包含"页面没有找到"等提示
                    if "页面没有找到" in response.text:
                        print(f"页面不存在：{url}")
                        continue
                    
                    # 解析HTML
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # 尝试多种方法提取行业信息
                    # 方法1：查找包含"行业"关键词的标签
                    industry = self._extract_industry_by_keyword(soup)
                    if industry != '未知':
                        return industry
                    
                    # 方法2：尝试通过特定的CSS选择器
                    industry = self._extract_industry_by_selector(soup)
                    if industry != '未知':
                        return industry
                    
                except Exception as e:
                    print(f"从{url}获取信息失败：{str(e)}")
                    continue
            
            # 所有URL都尝试失败
            return '未知'
            
        except Exception as e:
            print(f"获取股票{code}行业信息失败：{str(e)}")
            return '未知'
    
    def _extract_industry_by_keyword(self, soup):
        """通过关键词查找行业信息"""
        try:
            # 查找包含"行业"的标签
            for tag in soup.find_all(['td', 'span', 'div'], string=lambda text: text and '行业' in text):
                # 尝试获取下一个兄弟元素的文本
                sibling = tag.find_next_sibling(['td', 'span', 'div'])
                if sibling and sibling.text.strip() and sibling.text.strip() != '行业':
                    return sibling.text.strip()
                
                # 尝试获取父元素的下一个兄弟元素
                parent = tag.find_parent(['tr', 'div'])
                if parent:
                    next_parent = parent.find_next_sibling(['tr', 'div'])
                    if next_parent:
                        content = next_parent.text.strip()
                        if content and content != '行业':
                            return content
            
            return '未知'
        except:
            return '未知'
    
    def _extract_industry_by_selector(self, soup):
        """通过CSS选择器提取行业信息"""
        try:
            # 尝试多种可能的选择器
            selectors = [
                '.stockDetail > table tr:nth-child(3) td:nth-child(2)',
                '.table_bg001 > tbody > tr:nth-child(3) > td:nth-child(2)',
                '.sinastock_biz_info > table tr:nth-child(3) td:nth-child(2)',
                'div.biz_data > div:nth-child(3) > div:nth-child(2)'
            ]
            
            for selector in selectors:
                element = soup.select_one(selector)
                if element and element.text.strip():
                    return element.text.strip()
            
            return '未知'
        except:
            return '未知'
    
    def get_industry_from_eastmoney(self, code):
        """从东方财富网获取股票的行业信息作为备选数据源"""
        try:
            # 确保代码格式正确
            if len(code) < 6:
                code = code.zfill(6)
                print(f"补全股票代码为：{code}")
            
            # 东方财富网的URL结构
            if code.startswith('6'):
                # 沪市股票
                market_code = '1.' + code
            else:
                # 深市股票
                market_code = '0.' + code
            
            # 尝试不同的东方财富网页面
            urls = [
                f"https://quote.eastmoney.com/{market_code}.html",  # 行情页
                f"https://emweb.securities.eastmoney.com/PC_HSF10/CompanySurvey/Index?type={market_code}"  # 公司资料
            ]
            
            for url in urls:
                print(f"尝试从{url}获取行业信息")
                try:
                    # 发送请求
                    response = requests.get(url, headers=self.headers, timeout=10)
                    response.encoding = 'utf-8'
                    
                    # 检查响应状态
                    if response.status_code != 200:
                        print(f"请求失败，状态码：{response.status_code}")
                        continue
                    
                    # 解析HTML
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # 尝试提取行业信息
                    # 方法1：查找包含"行业"的标签
                    industry = self._extract_industry_by_keyword(soup)
                    if industry != '未知':
                        return industry
                    
                    # 方法2：针对东方财富网的特定选择器
                    try:
                        # 查找行业相关的链接或文本
                        industry_links = soup.find_all('a', href=lambda href: href and ('concept' in href or 'industry' in href))
                        for link in industry_links:
                            if link.text.strip() and len(link.text.strip()) > 1:
                                return link.text.strip()
                    except:
                        pass
                    
                except Exception as e:
                    print(f"从{url}获取信息失败：{str(e)}")
                    continue
            
            return '未知'
            
        except Exception as e:
            print(f"从东方财富网获取股票{code}行业信息失败：{str(e)}")
            return '未知'
    
    def get_industry_info(self, code):
        """获取股票的行业信息，优先使用新浪财经，失败时使用东方财富网"""
        # 首先尝试从新浪财经获取
        industry = self.get_industry_from_sina(code)
        
        # 如果获取失败或结果不理想，尝试从东方财富网获取
        if industry == '未知':
            industry = self.get_industry_from_eastmoney(code)
        
        return industry
    
    def get_stock_basic_info(self, code):
        """获取股票的基本信息，包括行业、市盈率等"""
        stock_info = {
            'code': code,
            'industry': '未知',
            'pe': 0,
            'pb': 0,
            'roe': 0,
            'market_cap': 0,
            'turnover_rate': 0
        }
        
        try:
            # 获取行业信息
            industry = self.get_industry_info(code)
            stock_info['industry'] = industry
            
            # 这里可以添加获取其他指标的代码，例如市盈率、市净率等
            # 由于不同网站的结构不同，可能需要针对不同指标编写不同的提取逻辑
            
        except Exception as e:
            print(f"获取股票{code}基本信息失败：{str(e)}")
        
        return stock_info
    
    def batch_get_stock_info(self, stock_list, delay=3):
        """批量获取股票信息，注意控制请求频率"""
        print(f"开始批量获取{len(stock_list)}只股票的免费数据源信息...")
        
        # 读取已有的免费数据（如果存在）
        existing_data = {}
        if os.path.exists(self.free_data_file):
            try:
                with open(self.free_data_file, 'r', encoding='utf-8') as f:
                    existing_data = {item['code']: item for item in json.load(f)}
            except:
                pass
        
        # 处理每只股票
        result_data = []
        success_count = 0
        
        for i, stock in enumerate(stock_list):
            stock_code = stock['ts_code']
            symbol = stock['symbol']  # 纯数字代码
            stock_name = stock['name']
            
            print(f"处理股票 {i+1}/{len(stock_list)}: {stock_name}({stock_code})")
            
            # 检查是否已有该股票的数据
            if stock_code in existing_data:
                print(f"  已存在该股票的数据，跳过获取")
                result_data.append(existing_data[stock_code])
                success_count += 1
                continue
            
            # 获取股票基本信息
            stock_info = self.get_stock_basic_info(symbol)
            
            # 补充股票完整代码和名称
            stock_info['full_code'] = stock_code
            stock_info['name'] = stock_name
            
            # 添加到结果列表
            result_data.append(stock_info)
            success_count += 1
            
            # 控制请求频率，避免被封IP
            if i < len(stock_list) - 1:
                print(f"  等待{delay}秒，控制请求频率...")
                time.sleep(delay)
        
        # 保存数据
        try:
            with open(self.free_data_file, 'w', encoding='utf-8') as f:
                json.dump(result_data, f, ensure_ascii=False, indent=2)
            
            print(f"\n批量获取完成！")
            print(f"成功获取了{success_count}只股票的免费数据源信息")
            print(f"数据已保存到：{self.free_data_file}")
            return result_data
            
        except Exception as e:
            print(f"保存免费数据失败：{str(e)}")
            return result_data

    def load_stock_list_from_csv(self, csv_file):
        """从CSV文件加载股票列表"""
        if not os.path.exists(csv_file):
            print(f"错误：股票列表文件{csv_file}不存在")
            return []
        
        try:
            df = pd.read_csv(csv_file)
            # 转换为字典列表
            stock_list = []
            for _, row in df.iterrows():
                stock_list.append({
                    'ts_code': row['ts_code'],
                    'symbol': str(row['symbol']),  # 确保是字符串格式
                    'name': row['name']
                })
            
            print(f"成功从CSV加载{len(stock_list)}只股票的列表")
            return stock_list
        except Exception as e:
            print(f"从CSV加载股票列表失败：{str(e)}")
            return []

# 主函数，用于运行免费数据源获取
if __name__ == "__main__":
    print("===== 免费股票数据源获取开始 =====")
    
    # 创建实例
    free_data = FreeStockData()
    
    # 从CSV文件加载股票列表
    csv_file = 'data/stock_list.csv'
    stock_list = free_data.load_stock_list_from_csv(csv_file)
    
    # 如果没有从CSV加载到股票列表，使用测试数据
    if not stock_list:
        stock_list = [
            {'ts_code': '600519.SH', 'symbol': '600519', 'name': '贵州茅台'},
            {'ts_code': '000858.SZ', 'symbol': '000858', 'name': '五粮液'},
            {'ts_code': '000333.SZ', 'symbol': '000333', 'name': '美的集团'}
        ]
    
    # 批量获取股票信息（增加请求间隔，避免被封IP）
    result = free_data.batch_get_stock_info(stock_list, delay=5)
    
    # 打印结果
    print("\n获取结果示例：")
    sample_count = min(3, len(result))  # 打印最多3个样本
    for stock in result[:sample_count]:
        print(f"股票：{stock['name']}({stock['full_code']})")
        print(f"  行业：{stock['industry']}")
        print(f"  市盈率(PE)：{stock['pe']}")
        print(f"  市净率(PB)：{stock['pb']}")
        print(f"  净资产收益率(ROE)：{stock['roe']}")
        
    print("\n===== 免费股票数据源获取结束 =====")