# AI教育评估系统

## 系统概述

这是一个基于CNN（卷积神经网络）的智能教育评估系统，能够分析学生的行为和学习模式，提供个性化的教育建议和解决方案。

## 核心功能

### 🤖 AI模型特性
- **基于CNN的深度学习模型**：使用卷积神经网络处理文本和数值特征
- **多模态输入**：结合文本描述和数值评分进行分析
- **实时分析**：快速生成个性化建议
- **迭代升级**：支持模型持续训练和改进

### 📊 分析能力
- **学习习惯分析**：识别注意力、作业、记忆力、动力等问题
- **课堂行为评估**：分析发言、活动、参与度等行为模式
- **社交能力评估**：评估朋友关系、沟通能力、自信心等
- **个性化建议**：基于年龄、学校类型、科目表现生成定制化建议

### 🔄 系统架构
```
前端 (HTML/CSS/JS) 
    ↓ HTTP请求
后端 API (FastAPI)
    ↓ 数据处理
AI模型 (PyTorch CNN)
    ↓ 分析结果
个性化建议生成
```

## 快速开始

### 1. 环境准备

确保已安装Python 3.8+，然后安装依赖：

```bash
# 激活虚拟环境（如果有）
cd backend
pip install -r requirements.txt
```

### 2. 启动系统

使用一键启动脚本：

```bash
python start_ai_system.py
```

或者手动启动：

```bash
# 启动后端API服务
cd backend
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload

# 启动前端服务（新终端）
python -m http.server 8080
```

### 3. 访问系统

- **前端界面**: http://localhost:8080
- **API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

## AI模型详解

### 模型架构

```python
EducationCNN(
    embedding: Embedding(10000, 128)
    conv1: Conv1d(128, 64, kernel_size=3)
    conv2: Conv1d(64, 128, kernel_size=3)
    conv3: Conv1d(128, 256, kernel_size=3)
    fc1: Linear(306, 512)  # 256(CNN) + 50(数值特征)
    fc2: Linear(512, 256)
    fc3: Linear(256, 128)
    fc4: Linear(128, 10)   # 输出类别
)
```

### 特征处理

1. **文本特征**：
   - 学习描述、行为描述、家长关注点
   - 使用词嵌入和CNN提取特征

2. **数值特征**：
   - 年龄、科目评分、行为模式
   - One-hot编码和归一化处理

3. **特征融合**：
   - 文本特征 + 数值特征
   - 全连接层进行最终分类

### 训练数据

系统包含1000+示例数据，涵盖：
- 不同年龄段（3-12岁）
- 多种学校类型
- 各种行为模式组合
- 对应的解决方案标签

## API接口

### 主要端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/analyze` | POST | 分析评估数据 |
| `/train` | POST | 训练模型 |
| `/save-model` | POST | 保存模型 |
| `/load-model` | POST | 加载模型 |
| `/health` | GET | 健康检查 |
| `/statistics` | GET | 使用统计 |

### 示例请求

```python
import requests

# 分析评估数据
data = {
    "child_name": "小明",
    "age": 8,
    "school_type": "public",
    "grade": "三年级",
    "subjects": {"chinese": 4, "math": 3, "english": 4},
    "learning_habits": ["attention", "homework"],
    "classroom_behavior": ["talking"],
    "social_behavior": ["friends"],
    "learning_description": "孩子在学习时经常分心",
    "behavior_description": "上课时经常与同学说话",
    "parent_concerns": "希望提高孩子的注意力"
}

response = requests.post("http://localhost:8000/analyze", json=data)
result = response.json()
print(result)
```

## 模型训练

### 自动训练

系统启动时会自动检查并训练模型：

```bash
python backend/train_model.py
```

### 自定义训练

```python
from ai_model import education_analyzer, AssessmentData

# 准备训练数据
training_data = [
    (assessment_data1, label1),
    (assessment_data2, label2),
    # ...
]

# 训练模型
education_analyzer.train_model(
    training_data=training_data,
    epochs=50,
    learning_rate=0.001
)

# 保存模型
education_analyzer.save_model("models/my_model.pth")
```

## 系统配置

### 环境变量

创建 `.env` 文件：

```env
# 模型配置
MODEL_PATH=models/education_model.pth
VOCAB_SIZE=10000
EMBEDDING_DIM=128
NUM_CLASSES=10

# API配置
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["*"]

# 训练配置
TRAINING_EPOCHS=50
LEARNING_RATE=0.001
BATCH_SIZE=32
```

### 模型参数

可在 `ai_model.py` 中调整：

```python
class EducationCNN(nn.Module):
    def __init__(self, 
                 vocab_size: int = 10000,
                 embedding_dim: int = 128,
                 num_classes: int = 10,
                 dropout: float = 0.3):
        # ...
```

## 性能优化

### GPU加速

系统自动检测GPU并优化：

```python
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = model.to(device)
```

### 批处理

支持批量处理多个评估：

```python
# 批量分析
batch_data = [data1, data2, data3]
results = []
for data in batch_data:
    result = education_analyzer.analyze_assessment(data)
    results.append(result)
```

## 监控和维护

### 日志记录

系统自动记录：
- 模型训练过程
- API调用统计
- 错误和异常
- 用户反馈

### 性能监控

```bash
# 查看API统计
curl http://localhost:8000/statistics

# 检查模型状态
curl http://localhost:8000/model-status
```

### 模型更新

支持在线模型更新：

```python
# 加载新模型
education_analyzer.load_model("models/new_model.pth")

# 热更新（无需重启服务）
requests.post("http://localhost:8000/load-model")
```

## 故障排除

### 常见问题

1. **模型加载失败**
   ```bash
   # 重新训练模型
   python backend/train_model.py
   ```

2. **API连接失败**
   ```bash
   # 检查服务状态
   curl http://localhost:8000/health
   ```

3. **依赖安装问题**
   ```bash
   # 更新pip
   pip install --upgrade pip
   
   # 重新安装依赖
   pip install -r backend/requirements.txt
   ```

### 调试模式

启用详细日志：

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 扩展开发

### 添加新的分析维度

1. 在 `AssessmentData` 中添加新字段
2. 更新预处理函数
3. 调整模型架构
4. 重新训练模型

### 集成其他AI模型

```python
# 可以轻松替换为其他模型
class CustomModel(nn.Module):
    def __init__(self):
        super().__init__()
        # 自定义架构
        pass
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进系统！

## 联系方式

如有问题，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件至项目维护者

---

**注意**: 这是一个教育研究项目，建议在专业指导下使用AI分析结果。 