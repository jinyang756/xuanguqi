# 选股器工具脚本说明

本目录包含选股器项目的各种工具脚本，用于数据处理、选股分析和项目维护。以下是各个脚本的功能说明和使用方法。

## 数据获取与处理

### tushare_basic_data.py
- **功能**: 使用Tushare API获取基础股票数据（零积分接口）
- **使用方法**: `python scripts/tushare_basic_data.py`
- **说明**: 
  - 每天限制获取10-20只股票的数据，避免触发Tushare API调用频率限制
  - 已获取的数据会保存在`data`目录下，下次运行时不会重复获取
  - 包含股票列表、日线数据等基础信息

### process_tushare_data.py
- **功能**: 将Tushare API获取的数据转换为选股器需要的格式
- **使用方法**: `python scripts/process_tushare_data.py`
- **说明**: 
  - 读取`data`目录下的原始数据
  - 计算技术指标，生成选股器需要的`stock_data.json`文件

### generate_mock_data.py
- **功能**: 生成模拟的股票数据，用于测试和开发环境
- **使用方法**: `python scripts/generate_mock_data.py`
- **说明**: 
  - 生成包含随机数据的`stock_data_mock.json`文件
  - 可用于在没有真实数据时测试选股器功能

### get_10_stocks.py
- **功能**: 生成10只逼真的A股模拟数据
- **使用方法**: `python scripts/get_10_stocks.py`
- **说明**: 
  - 生成包含行业、价格、涨跌幅等信息的模拟A股数据
  - 模拟数据参考了真实A股市场的特征

## 数据处理工具

### fix_encoding.py
- **功能**: 修复项目中可能出现的中文编码问题
- **使用方法**: `python scripts/fix_encoding.py`
- **说明**: 
  - 自动检测并修复Python文件中的编码问题
  - 特别针对Windows环境下的中文显示问题

### check_data_dir.py
- **功能**: 检查数据目录结构和文件完整性
- **使用方法**: `python scripts/check_data_dir.py`
- **说明**: 
  - 验证`data`目录是否存在及其下的必要子目录
  - 检查关键数据文件是否存在

### check_original_data.py
- **功能**: 检查原始数据文件的格式和完整性
- **使用方法**: `python scripts/check_original_data.py`
- **说明**: 
  - 验证原始数据文件的格式是否正确
  - 检查数据文件是否损坏或不完整

### check_structure.py
- **功能**: 检查项目整体文件结构是否符合规范
- **使用方法**: `python scripts/check_structure.py`
- **说明**: 
  - 验证项目目录结构是否完整
  - 检查必要文件是否存在

## 项目维护工具

### cleanup_project.py
- **功能**: 清理项目中的临时文件和不必要的数据
- **使用方法**: `python scripts/cleanup_project.py`
- **说明**: 
  - 删除临时文件、日志文件等
  - 清理缓存数据，释放存储空间

### perform_cleanup.py
- **功能**: 执行项目清理操作，与cleanup_project.py配合使用
- **使用方法**: `python scripts/perform_cleanup.py`
- **说明**: 
  - 执行具体的清理任务
  - 可以与其他清理工具配合使用

### verify_cleanup.py
- **功能**: 验证项目清理操作的结果
- **使用方法**: `python scripts/verify_cleanup.py`
- **说明**: 
  - 检查清理操作是否成功完成
  - 验证项目文件是否仍然完整

### fix_code_style.py
- **功能**: 修复代码风格问题，保持代码一致性
- **使用方法**: `python scripts/fix_code_style.py`
- **说明**: 
  - 格式化代码，使其符合项目代码规范
  - 修复缩进、空格等格式问题

## 服务启动脚本

### start_phone_verification_service.bat
- **功能**: 启动手机号验证服务
- **使用方法**: 双击运行或在命令行中执行`scripts\start_phone_verification_service.bat`
- **说明**: 
  - 启动后端API中的手机号验证服务
  - 用于处理用户手机号验证请求

### 更新股票数据.bat
- **功能**: 更新股票数据，解析通达信.day文件
- **使用方法**: 双击运行或在命令行中执行`scripts\更新股票数据.bat`
- **说明**: 
  - 解析通达信.day格式文件
  - 更新选股器的股票数据文件

## 使用流程建议

### 首次使用选股器
1. 获取基础股票数据：`python scripts/tushare_basic_data.py`
2. 处理数据：`python scripts/process_tushare_data.py`
3. 启动选股器：`python run_stock_selector.py`

### 日常更新数据
1. 运行更新股票数据.bat：`scripts\更新股票数据.bat`
2. 或者使用Tushare API更新：`python scripts/tushare_basic_data.py && python scripts/process_tushare_data.py`

### 项目维护
- 定期运行项目清理：`python scripts/cleanup_project.py`
- 检查数据完整性：`python scripts/check_data_dir.py`
- 修复编码问题：`python scripts/fix_encoding.py`

## 注意事项
1. Tushare API有调用频率限制，请不要频繁运行`python scripts/tushare_basic_data.py`
2. 免费用户限制：每分钟最多访问接口50次，每小时最多访问接口1次
3. 建议每天获取少量股票，逐步积累数据
4. 所有脚本都应该在项目根目录下运行，不要直接在scripts目录下运行