# 选股器 - 量化选股工具

一个基于多因子模型的量化选股工具，支持A股数据分析、筛选和可视化展示。

## 项目特点

- **A股过滤功能**：精确筛选A股市场股票数据
- **多因子选股算法**：基于短期上涨潜力模型
- **编码修复机制**：解决中文显示乱码问题
- **数据处理流水线**：支持通达信.day格式数据解析
- **优化的项目结构**：清晰的模块化设计，包含Serverless函数支持
- **可视化界面**：现代化UI设计，响应式布局，集成视觉特效
- **智能选股结果**：每次返回最优的一只个股

## 项目结构

优化后的项目采用清晰的模块化结构，便于维护和扩展：

```
选股器/
├── src/                  # 前端相关文件
│   ├── index.html        # 优化整合的主页面文件，包含完整功能
│   ├── js/               # JavaScript文件
│   │   ├── stock_selector.js # 选股算法模块
│   │   └── tushare_api.js    # API集成模块
│   ├── css/              # CSS样式文件
│   └── resources/        # 前端资源
│       └── fonts/        # 字体文件
├── api/                  # Serverless函数（用于Vercel部署）
│   └── select.py         # 选股API实现
├── backend/              # 后端Python脚本
│   ├── data_processing/  # 数据处理模块
│   │   ├── parse_day_files.py        # .day文件解析工具
│   │   ├── cleanup_a_stock_data.py   # A股数据清理工具
│   │   └── integrate_stock_data.py   # 数据整合脚本
│   ├── filtering/        # 股票筛选模块
│   │   ├── select_stock.py   # 股票筛选主脚本
│   │   └── filter_a_stocks.py # A股数据过滤脚本
│   ├── api/              # 后端API模块
│   │   ├── free_stock_data.py # 免费数据源脚本
│   │   ├── phone_storage.py # 电话号码存储功能
│   │   ├── save_phone_api.py # 保存电话号码API
│   │   ├── select.py        # 选股API实现
│   │   └── select_api.py    # 选股API封装
├── data/                 # 数据相关文件
│   ├── original/         # 原始数据
│   │   ├── a_stock_lday/     # A股.day格式数据文件
│   │   └── non_a_stock_lday/ # 非A股.day格式数据文件
│   ├── processed/        # 处理后的数据
│   │   └── stock_data_a_shares_fixed.json # 过滤后的A股数据
│   └── daily/            # 特定股票的日线数据
├── docs/                 # 文档目录
│   ├── README.md                 # 项目说明文档
│   ├── 开发者日志指南.md            # 开发和维护记录
│   └── A股数据清理和目录优化报告.md  # 数据清理报告
├── logs/                 # 日志文件目录
├── scripts/              # 工具脚本
│   ├── check_data_dir.py      # 数据目录检查
│   ├── check_original_data.py # 原始数据检查
│   ├── fix_encoding.py        # 编码修复工具
│   └── verify_cleanup.py      # 清理验证工具
├── config/               # 配置文件
│   └── vercel.json       # Vercel部署配置
├── DEPLOYMENT.md         # 部署说明文档
├── requirements.txt      # Python依赖声明
├── 更新股票数据.bat       # 数据更新批处理脚本
├── run_stock_selector.py # 主启动脚本
├── test_select.py        # 测试脚本
├── mock_test_single_stock.py # 模拟测试脚本
└── .gitignore            # Git忽略文件
```

## 功能介绍

1. **数据处理**
   - 解析通达信.day格式文件
   - 清洗和标准化股票数据
   - 缓存机制优化数据加载速度
   - A股数据过滤和分类

2. **选股功能**
   - 多因子选股算法（短期上涨潜力模型）
   - 技术指标计算（MA5/MA20/MA60均线、成交量均线、布林带等）
   - 突破策略实现（成交量放大、收盘价突破上轨、均线多头排列等）
   - 智能优选：每次仅返回最优的一只个股
   - 数据可视化展示

3. **Serverless函数支持**
   - 项目根目录下的`api/`目录包含Serverless函数实现
   - 支持Vercel平台自动部署
   - 通过`/api/select`接口提供选股服务

4. **界面特性**
   - 现代化UI设计
   - 响应式布局支持
   - 平滑动画效果
   - 支持更纱黑体显示

## 使用指南

### 1. 准备环境

确保您的计算机已安装Python 3.6或更高版本。项目运行需要以下第三方库：
- akshare：用于获取股票数据
- pandas：用于数据处理

可以通过以下命令安装依赖：
```bash
pip install akshare pandas
```

### 2. 更新股票数据

运行批处理脚本更新股票数据：

```bash
双击运行 "更新股票数据.bat"
```

该脚本会解析data/original/lday/目录下的.day文件，并将结果保存到data/processed/stock_data.json。

或者，您也可以手动运行以下脚本更新数据：

#### 方法1：使用Python脚本更新数据

1. 首先获取基础股票列表：
```bash
cd c:/Users/28163/Desktop/选股器
python backend/api/free_stock_data.py
```

2. 整合数据并生成最终的数据文件：
```bash
python backend/data_processing/integrate_stock_data.py
```

#### 方法2：解析通达信.day格式文件（如果有相关数据）

```bash
cd c:/Users/28163/Desktop/选股器/backend
python data_processing/parse_day_files.py
```

### 3. 启动选股器

#### 前端界面方式

启动Python HTTP服务器：

```bash
cd c:/Users/28163/Desktop/选股器
python -m http.server 8080
```

然后在浏览器中访问：http://localhost:8080/src/

#### 命令行方式

直接运行后端脚本：

```bash
cd c:/Users/28163/Desktop/选股器/backend/filtering
python select_stock.py
```

或者使用主启动脚本：

```bash
cd c:/Users/28163/Desktop/选股器
python run_stock_selector.py
```

## 开发说明

### 前端开发

前端采用HTML/CSS/JavaScript原生开发，无需构建工具。前端文件已优化整合，主要包括：

- `index.html`: 优化整合的主页面文件，集成了选股功能与现代UI设计
- `css/`: 样式表
- `js/`: 交互脚本
- `resources/`: 静态资源

修改前端代码时，直接编辑相应文件即可，无需额外的构建步骤。

前端通过以下方式与Serverless函数交互：
```javascript
fetch('/api/select')
  .then(response => response.json())
  .then(data => {
    // 注意：返回的结果最多包含一只优选个股
    if (data && data.length > 0) {
      const selectedStock = data[0];
      // 显示选股结果
    }
  });
```

### 后端开发

后端使用Python实现数据处理和选股逻辑，主要文件包括：
- `api/select.py`: Serverless函数实现，包含SimpleStockSelector类和handler函数
- backend/filtering/select_stock.py: 实现选股算法和结果展示
- backend/data_processing/parse_day_files.py: 解析通达信.day文件

关键类和方法：
- `SimpleStockSelector`类：实现选股核心功能
  - `calculate_technical_indicators()`: 计算技术指标
  - `breakout_strategy()`: 实现突破策略判断
  - `run_screening()`: 执行选股筛选并返回最优一只个股

### Serverless函数部署

项目支持在Vercel平台上进行Serverless部署：
1. Vercel会自动识别项目根目录下的`api/`目录
2. 确保项目根目录下存在`requirements.txt`文件，包含所有依赖
3. 部署后，可通过`/api/select`接口访问选股功能

详细部署说明请参考项目根目录下的`DEPLOYMENT.md`文件。

## 字体配置

项目支持使用更纱黑体（Sarasa Gothic）提升显示效果：

1. 从以下链接下载更纱黑体v1.0.32版本的TTF格式字体：
   - 清华大学镜像站：https://mirrors.tuna.tsinghua.edu.cn/github-release/be5invis/Sarasa-Gothic/LatestRelease/
   - GitHub Releases：https://github.com/be5invis/Sarasa-Gothic/releases/tag/v1.0.32

2. 推荐下载以下字重：
   - Sarasa Mono SC Regular（常规字重）
   - Sarasa Mono SC Bold（粗体字重）

3. 将下载的字体文件放置在resources/fonts/目录下

4. 刷新浏览器缓存以加载新字体

## 测试

项目包含多个测试脚本以验证功能正确性：
- `test_select.py`: 用于测试选股功能的基本逻辑
- `mock_test_single_stock.py`: 模拟测试，验证只返回第一只优选个股的功能

可以通过以下命令运行测试：
```bash
python test_select.py
python mock_test_single_stock.py
```

## 注意事项

1. 确保数据文件路径正确，特别是在修改项目结构后
2. 更新数据时，确保相关数据源文件存在
3. 如需自定义选股策略，可以修改相关Python或JavaScript文件
4. 字体文件需要手动下载并放置到指定目录以获得最佳显示效果
5. 当前项目没有使用npm或Node.js环境，前端通过Python HTTP服务器运行
6. API调用可能受到数据源限制，请确保遵守相关服务的使用条款
7. 选股结果仅供参考，不构成投资建议

## 常见问题

**问：为什么没有package.json文件？**
答：该项目前端使用纯HTML/CSS/JavaScript开发，没有依赖Node.js包，因此不需要package.json文件和npm命令。

**问：如何判断数据是否更新成功？**
答：检查data/processed/目录下是否生成了相应的数据文件，并且文件大小合理。

**问：启动服务器后无法访问页面怎么办？**
答：请检查服务器是否正常运行，以及浏览器地址是否正确（http://localhost:8080/src/）。

**问：为什么选股结果只返回一只股票？**
答：为了提高用户体验和决策效率，系统经过优化后，每次仅返回最优的一只个股。