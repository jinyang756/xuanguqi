# A股量化选股器

一个基于Node.js和Python的A股量化选股工具，帮助投资者通过量化策略筛选潜在的投资标的。前端已优化整合为单一index.html文件，提供现代UI设计和完整功能。

## 功能特点

- 多种量化选股策略支持
- 用户认证与权限管理
- 技术指标计算与分析
- 实时数据获取与处理
- 历史数据分析与回测
- 用户数据存储与同步
- 完善的日志系统与错误处理



## 项目结构

```
├── api/              # Serverless函数，包含后端API实现
│   ├── select.py     # 选股策略主要实现
│   ├── auth.js       # 认证相关功能
│   ├── get_user_data.js # 获取用户数据
│   ├── save_user_data.js # 保存用户数据
│   ├── delete_user_data.js # 删除用户数据
│   ├── export_user_data.js # 导出用户数据
│   ├── free_stock_data.js # 免费股票数据接口
│   └── user_data_storage.js  # 用户数据存储实现
├── middleware/       # 中间件
│   └── logger.js     # 日志中间件
├── data/             # 数据存储目录
├── src/              # 前端代码（已优化整合）
│   ├── index.html    # 整合后的主页面，包含完整功能和现代UI设计
│   ├── css/          # CSS样式文件
│   ├── js/           # 模块化JavaScript代码
│   ├── resources/    # 静态资源（字体等）
├── config.js         # 应用配置
├── server.js         # 主服务器文件
├── .env.example      # 环境变量模板
├── package.json      # Node.js依赖配置
├── requirements.txt  # Python依赖配置
├── DEPLOYMENT.md     # 部署指南
└── README.md         # 项目文档
```

## 技术栈

- **后端**：Node.js, Express, Python
- **数据库**：JSON文件存储（可扩展到MongoDB等）
- **认证**：JWT (JSON Web Token)
- **数据获取**：可通过Tushare API等获取A股数据
- **前端**：HTML5, CSS3, JavaScript
- **可视化**：Chart.js, particles.js
- **部署**：支持Vercel等平台部署

## 快速开始

### 环境要求

- Node.js 16.x 或 18.x
- Python 3.8+ （推荐3.10）
- npm 8.x+ 或 yarn

### 项目优化说明

1. 前端文件已优化整合为单一`index.html`文件，包含完整功能和现代UI设计
2. 支持Vercel等平台的一键部署
3. 本地开发与远程部署使用相同的代码结构
4. 所有DOM元素操作均添加了存在性检查，避免"Cannot read properties of null"类型错误

### 安装依赖

```bash
# 安装Node.js和Python依赖
npm run install-deps
```

### 配置环境变量

复制`.env.example`文件并重命名为`.env`，然后根据需要填写相关配置：

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件，填写必要的配置信息
# 例如Tushare API密钥、JWT密钥等
```

### 启动开发服务器

```bash
# 启动Node.js服务器（使用nodemon自动重启）
npm run dev

# 或者直接启动
npm start
```

服务器将在 http://localhost:3000 启动

### 构建与部署

```bash
# 构建项目（当前版本无需构建步骤）
npm run build

# 部署到Vercel（推荐）
# 1. 首先确保已安装Vercel CLI
npm i -g vercel

# 2. 登录Vercel
vercel login

# 3. 初始化并部署项目
vercel

# 4. 对于生产环境部署
vercel --prod
```

## API文档

### 认证相关

#### 发送验证码
```
POST /api/login/send-code
Content-Type: application/json

{
  "phoneNumber": "13812345678"
}
```

#### 验证验证码并登录
```
POST /api/login/verify-code
Content-Type: application/json

{
  "phoneNumber": "13812345678",
  "verificationCode": "123456"
}
```

### 选股相关

#### 执行选股策略
```
POST /api/select-stocks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "strategy": "breakout",
  "params": {
    "price_min": 10,
    "price_max": 100,
    "market_cap_min": 5000000000
  }
}
```

### 用户数据相关

#### 获取用户数据
```
GET /api/user-data
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 保存用户数据
```
POST /api/user-data
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "favoriteStocks": ["600000.SH", "600519.SH"],
  "watchlists": [
    {
      "name": "我的自选",
      "stocks": ["600000.SH", "000001.SZ"]
    }
  ]
}
```

### 系统相关

#### 获取应用配置
```
GET /api/config
```

#### 健康检查
```
GET /api/health
```

## 选股策略说明

### 默认策略
基于基本面和技术面的综合选股策略，考虑多个因子。

### 突破策略 (breakout)
寻找突破关键阻力位的股票，结合成交量和趋势判断。

### 量价策略 (volume)
基于成交量和价格关系的选股策略。

### 短期上涨潜力 (short-term-growth)
寻找短期内具有上涨潜力的股票。

## 配置说明

配置文件位于`config.js`，主要配置项包括：

- **dataSource**：数据源配置，可选择使用模拟数据或真实API数据
- **cache**：缓存配置，控制数据缓存行为
- **superAdmin**：超级管理员配置

## 日志系统

系统日志保存在`logs/`目录下，按日期分割。日志级别包括：
- info：一般信息
- warn：警告信息
- error：错误信息
- debug：调试信息（仅在开发环境显示）

## 部署指南

### Vercel部署

1. Fork项目到你的GitHub账户
2. 在Vercel上导入项目
3. 配置环境变量（根据`.env.example`文件）
4. 完成部署

### 本地部署

```bash
# 安装依赖
npm run install-deps

# 构建项目
npm run build

# 启动生产服务器
NODE_ENV=production npm start
```

## 开发指南

### 目录约定

- 所有API相关代码放在`api/`目录下
- 所有中间件放在`middleware/`目录下
- 前端代码放在`src/`目录下
- 配置文件放在项目根目录

### 代码风格

- JavaScript：遵循CommonJS规范，使用ES6+特性
- Python：遵循PEP 8规范

### 错误处理

- 所有API都应返回统一的JSON格式响应
- 错误处理应包含适当的错误代码和错误信息
- 关键操作应有日志记录

### 前端与Serverless函数的交互

前端通过以下方式与后端Serverless函数交互：

```javascript
// 示例代码：调用选股API
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

## 安全注意事项

- 不要在代码中硬编码敏感信息，使用环境变量
- 定期更新依赖包，避免安全漏洞
- 生产环境中不要启用调试模式
- 合理设置JWT过期时间

## 常见问题

### Q: 如何获取Tushare API密钥？
A: 访问[Tushare官网](https://tushare.pro/)注册账号并申请API密钥。

### Q: 如何添加新的选股策略？
A: 在`api/select.py`中添加新的策略函数，并在`server.js`中注册对应的API路由。

### Q: 如何查看系统日志？
A: 日志文件保存在`logs/`目录下，可以使用任何文本编辑器查看。

### Q: 项目前端和后端是如何组织的？
A: 前端已优化整合为单一`index.html`文件，包含完整功能和现代UI设计；后端API采用Serverless函数架构，位于`api/`目录。

### Q: 如何确保部署后不会出现"Cannot read properties of null"错误？
A: 项目已全面优化，所有DOM元素操作均添加了存在性检查，避免了此类错误的发生。

## API说明

### `/api/select`

**描述**: 执行选股算法，返回符合条件的个股
**方法**: GET
**返回**: JSON格式的选股结果

### `/api/get_user_data`

**描述**: 获取存储的用户数据
**方法**: GET
**返回**: JSON格式的用户数据

## 技术栈

- **前端**: HTML, CSS, JavaScript
- **后端**: Python, Node.js
- **数据分析**: pandas, akshare
- **部署**: Vercel Serverless Functions

## 注意事项

1. 本工具仅供学习和参考，不构成投资建议
2. 数据来源于第三方服务，可能存在延迟或不完整的情况
3. 在生产环境中，请确保遵守相关数据服务的使用条款
4. 定期更新requirements.txt中的依赖版本以确保兼容性

## License

ISC License