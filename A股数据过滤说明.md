# A股数据过滤说明

## 项目背景

为了提高选股器的分析准确性，我们对原始数据进行了A股股票的筛选，移除了ETF、基金、指数等非A股股票数据，确保选股分析仅基于纯粹的A股股票。

## 过滤过程

### 1. 过滤工具开发

开发了`filter_a_stocks.py`脚本，通过以下规则进行A股股票的筛选：

- **保留条件**：符合A股代码格式的股票
  - 沪市主板/科创板：600xxx.SH、601xxx.SH、603xxx.SH
  - 深市主板/中小板：000xxx.SZ、001xxx.SZ、002xxx.SZ
  - 深市创业板：300xxx.SZ

- **排除条件**：
  - 名称与代码相同的股票（通常为非A股）
  - 行业包含特定关键词的股票（ETF、指数、基金、债券等）

### 2. 数据处理结果

从原始的8737条股票数据中，成功筛选出20条纯粹的A股股票数据，主要包括：

| 股票代码    | 股票名称   | 所属行业   | 价格(元) |
|---------|--------|--------|------|
| 600519.SH | 贵州茅台   | 酿酒行业   | 145.34 |
| 000858.SZ | 五粮液    | 酿酒行业   | 12.25 |
| 000333.SZ | 美的集团   | 家电行业   | 7.33 |
| 002415.SZ | 海康威视   | 电子元件   | 3.04 |
| 600900.SH | 长江电力   | 电力行业   | 2.71 |
| 000725.SZ | 京东方A   | 电子元件   | 0.41 |

（完整列表请查看`data/processed/stock_data_a_shares_fixed.json`文件）

### 3. 编码修复

由于Windows命令行环境的编码问题，过滤后的A股数据出现了中文乱码。为此开发了`fix_a_shares_encoding.py`脚本，修复了以下文件的编码问题：

- `stock_data_a_shares.json` -> `stock_data_a_shares_fixed.json`（A股数据文件）
- `stock_data_a_shares_filter_report.txt` -> `stock_data_a_shares_filter_report_fixed.txt`（过滤报告）

## 选股器更新

已更新`backend/select_stock.py`文件，使其优先使用过滤后的A股数据文件进行选股分析：

1. 首先尝试加载`stock_data_a_shares_fixed.json`（过滤后的A股数据）
2. 如果A股数据文件不存在，则尝试使用`stock_data_fixed.json`（修复了编码的完整数据）
3. 最后才会尝试使用原始数据文件

## 验证结果

运行`run_stock_selector.py`脚本验证，选股器能够成功：

- 加载20条A股股票数据
- 执行选股算法并选出合适的股票
- 正确显示中文股票名称和行业信息

## 后续建议

1. **数据完整性提升**：
   - 当前A股数据中缺少一些重要财务指标（如PE、ROE等）
   - 建议补充完整的A股基本面数据，提高选股准确性

2. **过滤规则优化**：
   - 根据实际需求，可以进一步调整`filter_a_stocks.py`中的过滤规则
   - 例如添加更多行业分类、市值范围等筛选条件

3. **定期数据更新**：
   - 建议定期运行数据处理和过滤脚本，保持数据的时效性
   - 可以创建批处理文件，一键完成从原始数据到A股数据的处理流程

4. **选股算法改进**：
   - 基于纯粹的A股数据，可以进一步优化选股算法
   - 考虑添加行业轮动、技术指标等更多选股维度

## 文件位置

- 过滤工具：`filter_a_stocks.py`
- 编码修复工具：`fix_a_shares_encoding.py`
- 过滤后的A股数据：`data/processed/stock_data_a_shares_fixed.json`
- 过滤报告：`data/processed/stock_data_a_shares_filter_report_fixed.txt`
- 更新后的选股器：`backend/select_stock.py`