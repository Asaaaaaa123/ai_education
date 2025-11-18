# SpecialCare Connect 网站启动指南

## 快速启动

### 方法1：一键启动（推荐）
```bash
# 双击运行
start_website.bat
```

### 方法2：分别启动

#### 启动后端
```bash
cd backend
start_backend.bat
```

#### 启动前端
```bash
cd frontend
start_frontend.bat
```

## 手动启动

### 后端启动
```bash
cd backend
python start.py
```

### 前端启动
```bash
cd frontend
npm install
npm start
```

## 访问地址

- **前端网站**: http://localhost:3000
- **后端API**: http://localhost:8001
- **API文档**: http://localhost:8001/docs

## 故障排除

### 端口被占用
如果遇到端口被占用的问题：

1. **前端端口3000被占用**：
   - 修改 `frontend/.env` 文件中的 `PORT=3000` 为其他端口
   - 或者终止占用端口的进程

2. **后端端口8001被占用**：
   - 修改 `backend/app.py` 中的端口号
   - 同时修改 `frontend/package.json` 中的代理地址

### 依赖问题
如果遇到依赖问题：

1. **前端依赖**：
   ```bash
   cd frontend
   npm install
   ```

2. **后端依赖**：
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### 常见错误

1. **"Something is already running on port 3030"**
   - 这是因为前端默认配置了端口3030
   - 已修改为3000端口

2. **"Module not found"**
   - 运行 `npm install` 安装前端依赖
   - 运行 `pip install -r requirements.txt` 安装后端依赖

3. **"Cannot find module"**
   - 检查文件路径是否正确
   - 确保所有组件文件都存在

## 项目结构

```
ai_eduaction/
├── frontend/                 # React前端
│   ├── src/
│   │   ├── components/      # React组件
│   │   ├── App.js          # 主应用组件
│   │   └── index.js        # 入口文件
│   ├── public/             # 静态文件
│   ├── package.json        # 前端依赖
│   └── .env               # 环境配置
├── backend/                # FastAPI后端
│   ├── app.py             # 主应用文件
│   ├── start.py           # 启动脚本
│   ├── requirements.txt   # Python依赖
│   └── models/            # AI模型文件
├── start_website.bat      # 一键启动脚本
└── README_STARTUP.md      # 启动指南
```

## 功能特性

- ✅ 多年龄组评估（0-3岁、4-6岁、7岁以上）
- ✅ 年龄适应性游戏
- ✅ 舒尔特注意力测试
- ✅ AI智能分析
- ✅ 个性化建议生成
- ✅ 响应式设计
- ✅ 英文界面

## 技术栈

### 前端
- React 18.2.0
- React Router 6.3.0
- Axios 1.4.0
- Font Awesome 6.0.0

### 后端
- FastAPI 0.104.0+
- PyTorch 2.2.0+
- Uvicorn 0.24.0+
- Pydantic 2.5.0+

## 开发模式

启动后，前端会在开发模式下运行，支持热重载。后端API会自动重新加载代码更改。
