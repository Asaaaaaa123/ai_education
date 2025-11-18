# 故障排查指南

## 问题：输入完信息后显示 "Not Found"

### 可能原因

1. **后端服务未正确启动或路由未注册**
2. **API路径不正确**
3. **后端服务需要重启**

### 解决步骤

#### 1. 检查后端服务是否运行

访问：`http://localhost:8001/docs`

如果无法访问，说明后端服务未启动。

**启动后端：**
```bash
cd backend
python start.py
```

或者：
```bash
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

#### 2. 检查API路由是否正确注册

访问：`http://localhost:8001/docs`

在文档页面中，查找是否有以下路由：
- `POST /api/plans/children` - 创建孩子信息
- `GET /api/plans/children/{child_id}` - 获取孩子信息
- `POST /api/plans/test-results` - 提交测试结果
- `POST /api/plans/plans` - 创建训练计划

如果没有看到 `/api/plans` 相关路由，说明路由导入失败。

#### 3. 检查后端日志

查看后端终端输出，查找：
- `✅ 计划API路由导入成功` - 说明导入成功
- `⚠️ 计划API路由导入失败` - 说明导入失败
- `✅ 计划API路由已注册` - 说明路由已注册

如果看到导入失败的警告，检查：
1. `backend/api/plans.py` 文件是否存在
2. `backend/models/plan_generator.py` 文件是否存在
3. 导入路径是否正确

#### 4. 测试API

使用浏览器或工具测试API：

**创建孩子信息：**
```bash
POST http://localhost:8001/api/plans/children
Content-Type: application/json

{
  "name": "测试",
  "age": 6,
  "gender": "male",
  "birth_date": "2018-01-01",
  "parent_name": "测试家长"
}
```

**检查响应：**
- 如果返回 404，说明路由未注册
- 如果返回 500，检查后端日志查看错误信息
- 如果返回 200，说明API正常工作

#### 5. 检查前端控制台

打开浏览器开发者工具（F12），查看：
- **Console** 标签：查看是否有错误信息
- **Network** 标签：查看API请求的状态码

如果看到：
- 404 Not Found：后端路由未注册
- CORS错误：检查后端CORS配置
- 网络错误：检查后端服务是否运行

#### 6. 重启后端服务

如果修改了代码，需要重启后端服务：

1. 停止当前服务（Ctrl+C）
2. 重新启动：
   ```bash
   cd backend
   python start.py
   ```

#### 7. 检查文件结构

确保以下文件存在：
```
backend/
  ├── api/
  │   ├── __init__.py
  │   └── plans.py
  ├── models/
  │   ├── __init__.py
  │   └── plan_generator.py
  └── app.py
```

#### 8. 手动测试路由注册

运行检查脚本：
```bash
cd backend
python check_routes.py
```

查看输出中是否有 `/api/plans/children` 路由。

### 快速修复

如果以上步骤都无法解决问题，尝试：

1. **重启后端服务**（最常有效）
2. **检查后端日志**查看具体错误
3. **确认文件路径**是否正确
4. **检查Python版本**和依赖包

### 联系支持

如果问题仍然存在，请提供：
1. 后端服务日志输出
2. 浏览器控制台错误信息
3. 网络请求详情（Network标签）
4. 文件结构截图



