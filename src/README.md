# 选股器前端部署指南

本目录包含选股器的前端代码，可以部署到Vercel、GitHub Pages等静态托管平台。

## 部署到 Vercel（推荐）

1. 访问 [Vercel](https://vercel.com) 官网并登录
2. 点击 "New Project" 按钮
3. 选择你的 GitHub 仓库
4. Vercel会自动检测项目结构，无需额外配置
5. 点击 "Deploy" 按钮开始部署

**注意**：Vercel会自动识别项目根目录下的 `api/` 目录作为Serverless函数目录，确保项目根目录下存在 `requirements.txt` 文件。

## 部署到 GitHub Pages

1. 在GitHub仓库中，进入 "Settings" > "Pages"
2. 在 "Build and deployment" 部分：
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 "gh-pages"，目录选择 "/ (root)"
3. 点击 "Save" 按钮
4. 将src目录内容推送到gh-pages分支：
   ```bash
   # 在本地项目根目录执行
   git subtree push --prefix src origin gh-pages
   ```

**注意**：GitHub Pages仅支持静态资源部署，不支持Serverless函数功能。

## 静态资源说明

- `index.html`: 主页面文件
- `css/`: 样式文件
- `js/`: JavaScript脚本
- `resources/`: 静态资源（字体等）

## 与Serverless函数的交互

前端通过以下方式与后端Serverless函数交互：

```javascript
// 示例代码：调用选股API
fetch('/api/select')
  .then(response => response.json())
  .then(data => {
    // 处理选股结果
    // 注意：返回的结果最多包含一只优选个股
    if (data && data.length > 0) {
      const selectedStock = data[0];
      // 显示选股结果
    }
  })
  .catch(error => {
    console.error('选股API调用失败:', error);
  });
```

## 注意事项

1. 所有前端功能无需直接后端依赖，可以在部署后与Serverless函数协同工作
2. 在本地开发时，可以通过Python HTTP服务器预览前端页面
3. 如需自定义选股策略，可以修改相关JavaScript文件
4. 字体文件需要手动下载并放置到指定目录以获得最佳显示效果
5. 当前项目没有使用npm或Node.js环境，前端通过静态文件方式运行