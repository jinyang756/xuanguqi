# 部署说明

## 项目概述
本项目是一个基于多因子模型的量化选股工具，支持A股数据分析、筛选和可视化展示。部署分为前端静态资源部署和后端Serverless函数部署两部分。

## 前端部署文件

仅需将src目录下的以下文件推送到 Vercel 或静态托管平台：
- index.html（已优化整合，包含完整功能）
- js/目录下所有 JS 文件
- css/目录下所有 CSS 文件
- resources目录下的图片、字体等静态资源

## Serverless 函数部署

项目根目录下的 api/目录包含Serverless函数，用于提供选股功能的后端API支持：
- select.py：选股功能的主要实现，包含SimpleStockSelector类和handler函数

## 不参与部署的文件

以下目录和文件仅用于本地开发或数据处理，不参与前端部署：
- backend/
- scripts/
- data/
- logs/
- config/（除vercel.json外）
- docs/
- 测试文件、批处理脚本、说明文档等

## 推荐部署方式

### Vercel部署（推荐）

1. Vercel会自动识别 `api/` 目录中的Serverless函数和 `src/` 目录中的静态资源
2. 确保项目根目录下存在 `requirements.txt` 文件，包含必要的依赖（如akshare、pandas等）
3. Vercel会自动处理部署配置，无需额外设置

### GitHub Pages部署（仅前端）

1. 仅推送 `src` 目录内容到 gh-pages 分支
2. 注意：GitHub Pages仅支持静态资源，不支持Serverless函数

## 推送与部署流程建议

### 推送到 GitHub 仓库
保留所有项目文件，便于开发和维护。

### 部署到 Vercel

1. 连接GitHub仓库到Vercel
2. Vercel会自动检测项目结构并部署
3. 确保 `requirements.txt` 文件包含所有必要的依赖

### 部署后测试

1. 访问前端页面，测试选股功能
2. 验证API调用是否正常工作
3. 检查是否能正确返回优选出的个股结果

## 注意事项

1. API调用可能受到数据源限制，请确保遵守相关服务的使用条款
2. 免费数据源可能存在数据延迟或不完整的情况
3. 在生产环境中，建议使用更稳定的付费数据源
4. 选股结果仅供参考，不构成投资建议
5. 当前项目前端已优化整合，仅需部署单一的index.html文件