# Vercel 自动部署说明

本项目已配置GitHub Actions自动部署到Vercel平台。以下是配置步骤说明：

## 1. 配置GitHub Secrets

在GitHub仓库的「Settings > Secrets > Actions」页面添加以下secrets：

- **VERCEL_TOKEN**：Vercel的API令牌
  - 如何获取：登录Vercel，访问「Account Settings > Tokens」创建新令牌

- **VERCEL_ORG_ID**：Vercel组织ID
  - 如何获取：登录Vercel，访问「Team Settings > General > Team ID」

- **VERCEL_PROJECT_ID**：Vercel项目ID
  - 如何获取：登录Vercel，选择您的项目，访问「Settings > General > Project ID」

## 2. 项目结构优化

GitHub Actions工作流配置了**sparse-checkout**，只会检出必要的前端文件进行部署，这样可以：
- 减少部署时上传的文件数量
- 避免触发Vercel免费版的文件上传请求限制
- 同时保持所有文件都保留在GitHub仓库中

部署时会使用的文件包括：
- `src/index.html`：主页面
- `src/stock_selector.js`：选股器逻辑
- `src/tushare_api.js`：API交互逻辑
- `vercel.json`：Vercel配置文件
- `.gitignore`：Git忽略配置文件

## 3. 部署流程

当代码推送到`main`分支时，GitHub Actions会自动：
1. 检出项目的必要文件（使用sparse-checkout减少文件数量）
2. 安装Vercel CLI
3. 部署到Vercel预览环境（通过环境变量传递token）
4. 部署到Vercel生产环境（通过环境变量传递token）

## 4. 手动部署（可选）

如果需要手动部署，可以使用以下命令：

```bash
# 部署到预览环境
vercel --yes

# 部署到生产环境
vercel --prod --yes
```

## 5. 注意事项

- 确保您的Vercel账户有足够的部署配额
- 如果遇到部署错误，请检查GitHub Actions的运行日志
- 如需修改部署配置，可以编辑`.github/workflows/vercel-deploy.yml`文件

## 6. 故障排除

### 常见错误："--token"缺少值

如果遇到类似错误：`错误：您定义了"--token"，但它缺少一个值`，请确保：
1. 已正确在GitHub Secrets中配置了`VERCEL_TOKEN`
2. 工作流已优化为通过环境变量传递token，不再在命令行中直接使用`--token`参数

### 环境变量配置

工作流已配置为自动通过环境变量传递所有必要的Vercel配置：
- VERCEL_TOKEN：Vercel API令牌
- VERCEL_ORG_ID：Vercel组织ID
- VERCEL_PROJECT_ID：Vercel项目ID
- VERCEL_TELEMETRY_DISABLED：禁用遥测数据收集

这种方式更可靠，可以避免命令行参数解析问题。