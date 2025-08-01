# 🚀 部署指南

## 推荐平台：Railway

### 快速部署步骤：

1. **准备Git仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Railway部署**
   - 访问 [railway.app](https://railway.app)
   - 注册账号（可用GitHub登录）
   - 点击 "New Project" 
   - 选择 "Deploy from GitHub repo"
   - 选择你的项目仓库
   - Railway会自动检测Node.js项目并开始部署

3. **配置域名**
   - 部署完成后，Railway会提供一个 `.railway.app` 域名
   - 可以在设置中绑定自定义域名

### 其他平台选择：

#### Render (免费)
- 访问 [render.com](https://render.com)
- 创建新的Web Service
- 连接GitHub仓库
- 构建命令：`npm install`
- 启动命令：`npm start`

#### Fly.io
- 安装flyctl CLI
- 运行 `flyctl launch`
- 按提示配置并部署

### 环境变量设置：
部署时无需额外设置环境变量，项目会自动：
- 检测PORT环境变量
- 创建SQLite数据库
- 初始化样本数据

### 访问地址：
部署成功后，你将获得类似以下的访问地址：
- Railway: `https://your-app.railway.app`
- Render: `https://your-app.onrender.com`

### 注意事项：
- SQLite数据库在每次重新部署时会重置
- 如需持久化数据，考虑升级到付费计划使用持久化存储
- 免费计划可能有使用时间限制

### 本地测试：
```bash
npm start
```
访问：http://localhost:3001