# A股量化选股工具

## 项目概述

这是一个基于多因子模型的A股量化选股工具，通过技术指标分析和筛选算法，帮助用户识别符合特定条件的潜力个股。

## 项目特点

- **技术指标分析**：计算MA5、MA20、MA60等多种技术指标
- **突破策略筛选**：基于成交量、价格突破等多个条件筛选潜力股
- **可视化展示**：提供直观的数据可视化界面
- **Serverless架构**：基于Vercel部署，无需维护服务器
- **响应式设计**：适配不同设备的屏幕尺寸

## 项目结构

```
├── api/                 # Serverless函数目录
│   ├── select.py        # 选股功能的主要实现
│   ├── get_user_data.js # 获取用户数据的API
│   └── ...              # 其他API函数
├── src/                 # 前端源码目录
│   ├── index.html       # 主页面
│   ├── js/              # JavaScript文件
│   ├── css/             # CSS样式文件
│   └── resources/       # 静态资源(图片、字体等)
├── backend/             # 后端相关代码(仅本地开发)
├── config/              # 配置文件
├── data/                # 数据文件
├── vercel.json          # Vercel部署配置
├── requirements.txt     # Python依赖
└── package.json         # Node.js配置
```

## 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd stock-selector
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或使用yarn
   yarn install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   # 访问 http://localhost:8080/src/index.html
   ```

### 部署到Vercel

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录Vercel**
   ```bash
   vercel login
   ```

3. **部署预览**
   ```bash
   npm run preview
   ```

4. **部署到生产环境**
   ```bash
   npm run deploy
   ```

## 选股算法说明

本项目采用突破策略进行选股，主要条件包括：

1. 成交量大于20日均量的2倍
2. 收盘价突破20日最高价
3. 短期均线(MA5)在中期均线(MA20)之上，中期均线在长期均线(MA60)之上
4. 收盘价大于开盘价

系统会根据成交量比和突破强度计算综合得分，并返回得分最高的个股。

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