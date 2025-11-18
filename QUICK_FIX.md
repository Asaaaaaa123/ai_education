# 快速修复 Not Found 问题

## 问题
输入孩子信息后显示 "Not Found"

## 解决方案

### 方法1：重启后端服务（最重要！）

**必须重启后端服务才能使新的API路由生效！**

1. 在运行后端的终端窗口按 `Ctrl+C` 停止服务
2. 重新启动：
   ```bash
   cd backend
   python start.py
   ```
   或
   ```bash
   cd backend
   python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload
   ```

3. 查看启动日志，应该看到：
   - `✅ 计划API路由导入成功`
   - 或 `✅ 备用API路由已添加`

### 方法2：检查API文档

访问 `http://localhost:8001/docs`

在API文档页面查找是否有：
- `POST /api/plans/children` - 创建孩子信息

如果能看到这个路由，说明API已注册成功。

### 方法3：直接测试API

在浏览器访问或使用工具测试：
```
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

### 方法4：查看后端日志

查看后端终端输出：
- 如果有错误信息，查看具体错误
- 检查是否显示 "计划API路由导入失败"

### 如果仍然显示 Not Found

1. **确认后端服务正在运行**
   - 检查端口8001是否在监听
   - 访问 `http://localhost:8001/health` 应该返回健康状态

2. **检查浏览器控制台**
   - 按F12打开开发者工具
   - 查看Console标签中的错误信息
   - 查看Network标签中的API请求状态

3. **清除浏览器缓存**
   - 按Ctrl+Shift+Delete清除缓存
   - 或使用无痕模式访问

## 重要提示

- **每次修改后端代码后必须重启服务！**
- 使用 `--reload` 参数可以自动重载，但有时需要手动重启
- 确保所有文件已保存后再重启

## 测试步骤

1. 重启后端服务
2. 访问 `http://localhost:8001/docs` 查看API文档
3. 在API文档中测试 `POST /api/plans/children`
4. 如果API文档中测试成功，再在前端页面测试










