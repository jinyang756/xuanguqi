# Tushare API 选股器集成方案

本方案提供了完整的Tushare API集成工具，帮助选股器获取和处理真实的股票数据。

## 已创建的文件

1. **tushare_basic_data.py** - Tushare零积分接口数据获取脚本
2. **process_tushare_data.py** - 数据处理脚本，将Tushare数据转换为选股器格式
3. **tushare_integration.py** - 完整版Tushare API集成脚本（需要较高积分权限）
4. **tushare_api.js** - 前端JavaScript库，用于在选股器页面集成Tushare API功能

## 使用说明

### 基础使用方法（零积分接口）

1. **获取基础股票数据**
   ```bash
   python tushare_basic_data.py
   ```
   - 此脚本使用Tushare的零积分接口获取基础股票数据
   - 每天限制获取10-20只股票的数据，避免触发调用频率限制
   - 已获取的数据会保存在`data`目录下，下次运行时不会重复获取

2. **处理数据并生成stock_data.json**
   ```bash
   python process_tushare_data.py
   ```
   - 此脚本将获取的基础数据转换为选股器需要的格式
   - 生成的`stock_data.json`文件可直接被选股器使用

### 完整功能（需要较高积分权限）

```bash
python tushare_integration.py
```
- 此脚本使用Tushare的更多接口获取完整的股票数据
- 包含基本面指标、财务数据等更多信息
- 但需要较高的Tushare积分权限

## 数据特点

### 通过零积分接口获取的数据包含：
- 股票代码、名称
- 最新价格
- 涨跌幅
- 成交量
- 行业信息（已部分补充）

### 受限字段（需要积分权限）：
- 市盈率(PE)
- 净资产收益率(ROE)
- 换手率
- 市净率(PB)
- 成交额
- 市值

## 使用建议

1. **每日数据更新**
   - 建议每天只运行一次`python tushare_basic_data.py`
   - 每次运行可获取10-20只股票的最新数据
   - 运行后需要运行`python process_tushare_data.py`来更新选股器数据

2. **避开调用频率限制**
   - Tushare API有严格的调用频率限制，请勿频繁运行脚本
   - 免费用户限制：每分钟最多访问接口50次，每小时最多访问接口1次
   - 建议每天获取少量股票，逐步积累数据

3. **数据存储**
   - 股票列表保存在`data/stock_list.csv`
   - 日线数据保存在`data/daily/`目录下
   - 转换后的选股器数据保存在`stock_data.json`

4. **前端集成**
   - `tushare_api.js`已集成到`index.html`中
   - 选股器页面现在可以优先从API加载数据
   - 添加了股票搜索功能，可快速查找特定股票

## 注意事项

1. 本方案使用的Tushare token为：`e4f693ec67d80ef11b6fd446007110cd95bbf82508b7a7758e4f6fad`
2. 请不要将此token分享给他人，避免超出调用限制
3. 如果需要获取更多字段或更频繁的数据更新，建议升级Tushare账户获取更高权限
4. 脚本中包含错误处理和默认数据，确保在API调用受限的情况下也能正常运行

## 常见问题解决

1. **API调用失败**
   - 错误信息："抱歉，您每分钟最多访问该接口50次"
   - 解决方法：等待一分钟后再运行脚本，或减少每次获取的股票数量

2. **数据文件不存在**
   - 错误信息："No such file or directory: 'data/stock_list.csv'"
   - 解决方法：先运行`python tushare_basic_data.py`创建数据文件

3. **无法获取完整字段**
   - 问题：部分字段显示为0.0
   - 解决方法：这些字段需要更高的Tushare积分权限，目前使用默认值