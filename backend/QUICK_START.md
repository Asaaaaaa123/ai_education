# 🚀 快速启动指南

## 问题修复说明

已修复以下问题：
1. ✅ **FastAPI 弃用警告** - 使用新的 lifespan 事件处理器
2. ✅ **Uvicorn 配置问题** - 移除 reload 参数，使用正确的启动方式
3. ✅ **启动失败** - 修复应用启动逻辑

## 启动方式

### 方式1: 智能启动（推荐）
```bash
# 自动找到可用端口并启动
python smart_start.py
```

### 方式2: 端口检查
```bash
# 检查端口占用情况
python check_ports.py
```

### 方式3: 批处理文件
```bash
# Windows用户直接双击
start.bat
```

### 方式4: Python脚本
```bash
python start.py
```

### 方式5: 直接启动
```bash
python -m uvicorn app:app --host 0.0.0.0 --port 8001
```

### 方式6: 测试应用
```bash
python test_app.py
```

## 验证启动

启动成功后，您应该看到：
```
INFO:__main__:启动SpecialCare Connect API服务器...
INFO:uvicorn.server:Uvicorn running on http://0.0.0.0:8001
```

## 访问地址

- **API服务**: http://localhost:8001
- **API文档**: http://localhost:8001/docs
- **健康检查**: http://localhost:8001/health

## 常见问题

### 1. 依赖包缺失
```bash
pip install -r requirements.txt
```

### 2. 端口被占用
修改端口号：
```bash
python -m uvicorn app:app --host 0.0.0.0 --port 8002
```

### 3. 权限问题
以管理员身份运行命令提示符

## 功能验证

启动后可以测试以下功能：
- ✅ 健康检查
- ✅ 教育评估分析
- ✅ 静态文件服务
- ✅ AI模型加载 