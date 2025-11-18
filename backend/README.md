# SpecialCare Connect - 后端API

## 概述

这是一个统一的后端应用，整合了AI模型、API接口和静态文件服务，为特殊儿童教育评估提供完整的后端支持。

## 文件结构

```
backend/
├── app.py              # 主应用文件（统一后端）
├── start.py            # Python启动脚本
├── start.bat           # Windows批处理启动文件
├── requirements.txt    # Python依赖包
├── README.md          # 说明文档
├── models/            # 模型存储目录
├── feedback/          # 反馈数据目录
└── venv/              # Python虚拟环境
```

## 快速启动

### 方法1: 使用批处理文件（Windows推荐）
```bash
# 双击运行
start.bat
```

### 方法2: 使用Python脚本
```bash
python start.py
```

### 方法3: 直接运行主文件
```bash
python app.py
```

## 功能特性

### 🔧 核心功能
- **AI教育评估分析** - 基于CNN的智能分析模型
- **规则基础分析** - 备用分析方案
- **个性化建议生成** - 针对不同问题的专业建议
- **评估历史管理** - 记录和查询评估历史
- **模型训练** - 支持模型在线训练和优化

### 🌐 API接口
- `GET /` - API根路径
- `GET /health` - 健康检查
- `POST /analyze` - 教育评估分析
- `GET /history` - 获取评估历史
- `POST /train` - 训练模型
- `GET /model-status` - 模型状态
- `GET /statistics` - 使用统计

### 📁 静态文件服务
- 自动挂载前端静态文件
- 支持favicon、manifest等文件
- 解决404错误问题

## 配置说明

### 环境要求
- Python 3.8+
- 依赖包：见 `requirements.txt`

### 端口配置
- 默认端口：8000
- 可在 `app.py` 中修改

### 模型配置
- 模型文件：`models/education_model.pth`
- 自动加载已保存的模型
- 支持模型训练和保存

## 开发说明

### 添加新的API端点
在 `app.py` 中的 `# ==================== API路由 ====================` 部分添加新的路由函数。

### 修改AI模型
在 `app.py` 中的 `# ==================== AI模型 ====================` 部分修改模型结构。

### 自定义分析规则
在 `EducationAnalyzer` 类的 `_rule_based_analysis` 方法中修改分析逻辑。

## 故障排除

### 常见问题

1. **端口被占用**
   ```
   错误: Address already in use
   解决: 修改端口号或关闭占用端口的程序
   ```

2. **依赖包缺失**
   ```
   错误: ModuleNotFoundError
   解决: pip install -r requirements.txt
   ```

3. **模型加载失败**
   ```
   警告: 模型加载失败
   解决: 检查模型文件是否存在，或使用规则基础分析
   ```

4. **静态文件404错误**
   ```
   错误: 404 Not Found for favicon.ico
   解决: 确保前端public目录存在，或生成favicon.ico文件
   ```

### 日志查看
应用运行时会输出详细的日志信息，包括：
- 启动状态
- 模型加载状态
- API请求日志
- 错误信息

## 部署说明

### 生产环境部署
1. 使用 `uvicorn` 或 `gunicorn` 部署
2. 配置反向代理（如Nginx）
3. 设置环境变量
4. 配置SSL证书

### Docker部署
```bash
# 构建镜像
docker build -t specialcare-connect .

# 运行容器
docker run -p 8000:8000 specialcare-connect
```

## 联系支持

如有问题，请查看日志输出或联系开发团队。 