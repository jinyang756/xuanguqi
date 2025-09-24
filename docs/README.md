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
├── .github/              # GitHub配置文件
│   └── workflows/        # GitHub Actions工作流
├── .vercel/              # Vercel配置文件
├── .vscode/              # VS Code配置文件
├── DEPLOYMENT.md         # 部署说明文档
├── __pycache__/          # Python编译缓存
│   └── generate_mock_data.cpython-38.pyc
├── api/                  # Serverless函数（用于Vercel部署）
│   ├── __pycache__/
│   │   └── select.cpython-38.pyc
│   └── select.py         # 选股API实现
├── backend/              # 后端Python脚本
│   ├── api/              # 后端API模块
│   │   ├── free_stock_data.py  # 免费数据源脚本
│   │   ├── phone_storage.py    # 电话号码存储功能
│   │   ├── save_phone_api.py   # 保存电话号码API
│   │   ├── select.py           # 选股API实现
│   │   └── select_api.py       # 选股API封装
│   └── filtering/        # 股票筛选模块
│       ├── filter_a_stocks.py  # A股数据过滤脚本
│       └── select_stock.py     # 股票筛选主脚本
├── clean_workspace.bat   # 工作区清理脚本
├── config.js             # 配置文件
├── config/               # 配置文件目录
│   └── vercel.json       # Vercel部署配置
├── docs/                 # 文档目录
│   └── README.md         # 项目说明文档
├── fonts/                # 字体文件
│   └── MapleMono-NF-CN-Regular.ttf
├── mock_test_single_stock.py  # 模拟测试脚本
├── requirements.txt      # Python依赖声明
├── resources/            # 资源文件（目前为空）
├── src/                  # 前端相关文件
│   ├── README.md         # 前端模块说明文档
│   ├── css/              # CSS样式文件
│   │   └── effects.css   # 视觉特效样式
│   ├── index.html        # 优化整合的主页面文件，包含完整功能
│   ├── js/               # JavaScript文件
│   │   ├── stock_selector.js  # 选股算法模块
│   │   ├── tushare_api.js     # API集成模块
│   │   └── visual_effects.js  # 视觉特效实现
│   └── resources/        # 前端资源
│       └── fonts/
├── test_select.py        # 测试脚本
└── test_single_stock.py  # 单只股票测试脚本
```

## 功能介绍

1. **数据处理**
   - 解析通达信.day格式文件
   - 清洗和标准化股票数据
   - A股数据过滤和分类

2. **选股功能**
   - 多因子选股算法（短期上涨潜力模型）
   - 技术指标计算
   - 突破策略实现
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
    // 处理选股结果
    if (data && data.length > 0) {
      const selectedStock = data[0];
      // 显示选股结果
    }
  })
  .catch(error => {
    console.error('选股API调用失败:', error);
  });
```

### 后端开发

后端使用Python实现数据处理和选股逻辑，主要文件包括：
- `api/select.py`: Serverless函数实现
- `backend/filtering/select_stock.py`: 实现选股算法和结果展示

## Serverless函数部署

项目支持在Vercel平台上进行Serverless部署：
1. Vercel会自动识别项目根目录下的`api/`目录
2. 确保项目根目录下存在`requirements.txt`文件，包含所有依赖
3. 部署后，可通过`/api/select`接口访问选股功能

详细部署说明请参考项目根目录下的`DEPLOYMENT.md`文件。

## 字体配置

项目支持使用更纱黑体（Sarasa Gothic）提升显示效果：

1. 从以下链接下载更纱黑体的TTF格式字体
2. 将下载的字体文件放置在resources/fonts/目录下
3. 刷新浏览器缓存以加载新字体

## 测试

项目包含多个测试脚本以验证功能正确性：
- `test_select.py`: 用于测试选股功能的基本逻辑
- `mock_test_single_stock.py`: 模拟测试，验证只返回第一只优选个股的功能
- `test_single_stock.py`: 单只股票测试脚本

可以通过以下命令运行测试：
```bash
python test_select.py
python mock_test_single_stock.py
python test_single_stock.py
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
答：检查相关数据目录下是否生成了相应的数据文件，并且文件大小合理。

**问：启动服务器后无法访问页面怎么办？**
答：请检查服务器是否正常运行，以及浏览器地址是否正确（http://localhost:8080/src/）。