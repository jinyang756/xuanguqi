# 选股器前端部署指南

本目录包含选股器的前端代码，可以部署到Vercel、GitHub Pages等静态托管平台。

## 部署到 Vercel

1. 访问 [Vercel](https://vercel.com) 官网并登录
2. 点击 "New Project" 按钮
3. 选择你的 GitHub 仓库
4. 在 "Configure Project" 页面，设置以下选项：
   - Root Directory: 保持为空（Vercel会自动读取config/vercel.json配置）
   - Framework Preset: 选择 "Other"
5. 点击 "Deploy" 按钮开始部署

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

## 静态资源说明

- `index.html`: 主页面文件
- `css/`: 样式文件
- `js/`: JavaScript脚本
- `resources/`: 静态资源（字体等）

所有前端功能无需后端依赖，可以直接在浏览器中运行。