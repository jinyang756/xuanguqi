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
3. 设置Vercel环境变量
4. 部署到Vercel预览环境（使用命令行参数指定组织和项目）
5. 部署到Vercel生产环境（使用命令行参数指定组织和项目）

## 4. 手动部署（可选）

如果需要手动部署，可以使用以下命令：

```bash
# 部署到预览环境
vercel --yes --token YOUR_VERCEL_TOKEN --org YOUR_VERCEL_ORG_ID --project YOUR_VERCEL_PROJECT_ID

# 部署到生产环境
vercel --prod --yes --token YOUR_VERCEL_TOKEN --org YOUR_VERCEL_ORG_ID --project YOUR_VERCEL_PROJECT_ID
```

请将命令中的`YOUR_VERCEL_TOKEN`、`YOUR_VERCEL_ORG_ID`和`YOUR_VERCEL_PROJECT_ID`替换为您实际的Vercel凭据。

## 5. 注意事项

- 确保您的Vercel账户有足够的部署配额
- 如果遇到部署错误，请检查GitHub Actions的运行日志
- 如需修改部署配置，可以编辑`.github/workflows/vercel-deploy.yml`文件

## 6. 故障排除

### 常见错误："您无权访问指定的帐户"或"--token"缺少值

如果遇到类似错误，请确保：
1. 已正确在GitHub Secrets中配置了`VERCEL_TOKEN`、`VERCEL_ORG_ID`和`VERCEL_PROJECT_ID`
2. 确保token具有足够的权限访问指定的组织和项目
3. 检查Vercel账户中是否确实存在该组织和项目

### 权限问题

根据Vercel官方文档，如果遇到`scope-not-accessible`错误，通常是因为：
- 提供的token没有足够的权限访问指定的组织或项目
- 组织或项目ID不正确
- token已过期或被撤销

### 工作流配置

工作流已优化为：
1. 通过环境变量设置`VERCEL_TOKEN`
2. 在部署命令中使用`--org`和`--project`参数明确指定组织和项目
3. 自动禁用遥测数据收集以避免相关问题

这种配置方式可以解决大多数权限和参数解析问题。