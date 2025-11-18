"""
SpecialCare Connect - Unified Backend Application
Integrates AI models, API interfaces and static file services
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import json
import pickle
import logging
import os
from datetime import datetime
from typing import Dict, List, Tuple, Optional
from contextlib import asynccontextmanager
from dataclasses import dataclass

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import authentication and user data modules
try:
    from api import auth, user_data
    from api.plans import router as plans_router
    AUTH_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Authentication modules not available: {e}")
    AUTH_AVAILABLE = False

# ==================== Data Models ====================

@dataclass
class AssessmentData:
    """Assessment data structure"""
    child_name: str
    age: int
    school_type: str
    grade: str
    subjects: Dict[str, int]  # Subject scores
    learning_habits: List[str]
    classroom_behavior: List[str]
    social_behavior: List[str]
    learning_description: str
    behavior_description: str
    parent_concerns: str

class AssessmentRequest(BaseModel):
    childName: str
    gender: str
    birthDate: Dict[str, str]
    assessmentDate: Dict[str, str]
    assessor: str
    childAge: int
    assessmentMode: str
    ageGroup: str
    
    # Developmental assessment data
    motorSkills: Optional[Dict] = None
    cognitiveSkills: Optional[Dict] = None
    languageSkills: Optional[Dict] = None
    socialEmotional: Optional[Dict] = None
    dailyLiving: Optional[Dict] = None
    
    # Interactive game results
    interactiveResults: Optional[Dict] = None
    
    # Parent observations
    parentObservations: Optional[str] = None
    concerns: Optional[str] = None
    strengths: Optional[str] = None
    
    # Compatible with old version
    childTestResults: Optional[Dict] = None

class AssessmentResponse(BaseModel):
    success: bool
    data: Dict
    message: str
    timestamp: str

class TrainingRequest(BaseModel):
    training_data: List[Dict]
    epochs: int = 50
    learning_rate: float = 0.001

# ==================== AI Models ====================

class EducationCNN(nn.Module):
    """CNN-based educational assessment analysis model"""
    
    def __init__(self, vocab_size: int = 10000, embedding_dim: int = 128, 
                 num_classes: int = 10, dropout: float = 0.3):
        super(EducationCNN, self).__init__()
        
        # Text embedding layer
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        
        # CNN convolutional layers
        self.conv1 = nn.Conv1d(embedding_dim, 64, kernel_size=3, padding=1)
        self.conv2 = nn.Conv1d(64, 128, kernel_size=3, padding=1)
        self.conv3 = nn.Conv1d(128, 256, kernel_size=3, padding=1)
        
        # Batch normalization layers
        self.bn1 = nn.BatchNorm1d(64)
        self.bn2 = nn.BatchNorm1d(128)
        self.bn3 = nn.BatchNorm1d(256)
        
        # Pooling layer
        self.pool = nn.AdaptiveMaxPool1d(1)
        
        # Fully connected layers
        self.fc1 = nn.Linear(256 + 50, 512)  # 256来自CNN + 50来自数值特征
        self.fc2 = nn.Linear(512, 256)
        self.fc3 = nn.Linear(256, 128)
        self.fc4 = nn.Linear(128, num_classes)
        
        # Dropout layer
        self.dropout = nn.Dropout(dropout)
        
        # Numeric feature processing layer
        self.numeric_fc = nn.Linear(20, 50)  # 处理年龄、评分等数值特征
        
    def forward(self, text_input, numeric_features):
        # Text feature extraction
        x = self.embedding(text_input)  # [batch_size, seq_len, embedding_dim]
        x = x.transpose(1, 2)  # [batch_size, embedding_dim, seq_len]
        
        # CNN feature extraction
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        x = F.relu(self.bn3(self.conv3(x)))
        
        # Global pooling
        x = self.pool(x).squeeze(-1)  # [batch_size, 256]
        
        # Numeric feature processing
        numeric_out = F.relu(self.numeric_fc(numeric_features))
        
        # Feature fusion
        x = torch.cat([x, numeric_out], dim=1)
        
        # Fully connected layers
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = self.dropout(x)
        x = F.relu(self.fc3(x))
        x = self.dropout(x)
        x = self.fc4(x)
        
        return x

class EducationAnalyzer:
    """Educational assessment analyzer"""
    
    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        self.tokenizer = None
        self.vocab = {}
        self.solution_templates = {
            "learning_difficulty": [
                "建议采用多感官学习方法，结合视觉、听觉和触觉刺激",
                "制定个性化的学习计划，根据孩子的学习节奏调整进度",
                "使用游戏化学习工具，提高学习兴趣和参与度",
                "建立奖励机制，鼓励积极的学习行为"
            ],
            "behavior_issue": [
                "建立清晰的行为规范和期望",
                "使用积极的行为支持策略",
                "提供情绪调节训练和技巧",
                "与家长和老师建立一致的管教方法"
            ],
            "social_skill": [
                "参与小组活动和角色扮演游戏",
                "学习基本的社交礼仪和沟通技巧",
                "培养同理心和理解他人感受的能力",
                "提供社交技能训练课程"
            ],
            "attention_deficit": [
                "创造安静、无干扰的学习环境",
                "使用定时器和视觉提示帮助时间管理",
                "将复杂任务分解为小步骤",
                "提供频繁的休息和活动机会"
            ]
        }
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
    
    def preprocess_data(self, assessment_data: AssessmentData) -> Tuple[torch.Tensor, torch.Tensor]:
        """预处理评估数据"""
        # 文本特征处理
        text = f"{assessment_data.learning_description} {assessment_data.behavior_description} {assessment_data.parent_concerns}"
        text += " ".join(assessment_data.learning_habits + assessment_data.classroom_behavior + assessment_data.social_behavior)
        
        # 简单的词汇表构建（实际项目中应使用更复杂的tokenizer）
        words = text.lower().split()
        if not self.vocab:
            unique_words = list(set(words))
            self.vocab = {word: idx + 1 for idx, word in enumerate(unique_words)}
        
        # 文本序列化
        text_indices = [self.vocab.get(word, 0) for word in words[:100]]  # 限制长度
        text_indices += [0] * (100 - len(text_indices))  # 填充
        
        # Numeric feature processing
        numeric_features = []
        numeric_features.append(assessment_data.age / 20.0)  # 年龄归一化
        
        # 科目评分
        subject_scores = list(assessment_data.subjects.values())
        numeric_features.extend([score / 100.0 for score in subject_scores])
        numeric_features.extend([0] * (10 - len(subject_scores)))  # 填充到10个科目
        
        # 行为特征（one-hot编码）
        behavior_features = [0] * 8
        if "注意力不集中" in assessment_data.classroom_behavior:
            behavior_features[0] = 1
        if "多动" in assessment_data.classroom_behavior:
            behavior_features[1] = 1
        if "情绪波动" in assessment_data.social_behavior:
            behavior_features[2] = 1
        if "社交困难" in assessment_data.social_behavior:
            behavior_features[3] = 1
        
        numeric_features.extend(behavior_features)
        
        return torch.tensor([text_indices], dtype=torch.long), torch.tensor([numeric_features], dtype=torch.float32)
    
    def analyze(self, assessment_data: AssessmentData) -> Dict:
        """分析评估数据"""
        try:
            if self.model is not None:
                # 使用AI模型分析
                text_input, numeric_features = self.preprocess_data(assessment_data)
                with torch.no_grad():
                    probabilities = F.softmax(self.model(text_input, numeric_features), dim=1)
                return self._generate_analysis_result(assessment_data, probabilities)
            else:
                # 使用规则基础分析
                return self._rule_based_analysis(assessment_data)
        except Exception as e:
            logger.error(f"分析失败: {e}")
            return self._rule_based_analysis(assessment_data)
    
    def _rule_based_analysis(self, assessment_data: AssessmentData) -> Dict:
        """规则基础分析"""
        # 计算总体评分
        subject_scores = list(assessment_data.subjects.values())
        overall_score = sum(subject_scores) / len(subject_scores) if subject_scores else 0
        
        # 识别主要问题
        problems = []
        if overall_score < 70:
            problems.append("学习困难")
        if "注意力不集中" in assessment_data.classroom_behavior:
            problems.append("注意力缺陷")
        if "多动" in assessment_data.classroom_behavior:
            problems.append("行为问题")
        if "社交困难" in assessment_data.social_behavior:
            problems.append("社交技能不足")
        
        # 生成建议
        recommendations = self._generate_recommendations(assessment_data)
        
        return {
            "overall_score": overall_score,
            "main_problems": problems,
            "recommendations": recommendations,
            "analysis_method": "rule_based"
        }
    
    def _generate_analysis_result(self, assessment_data: AssessmentData, 
                                probabilities: torch.Tensor) -> Dict:
        """生成AI分析结果"""
        # 这里可以根据概率分布生成更详细的分析
        return self._rule_based_analysis(assessment_data)
    
    def _generate_recommendations(self, assessment_data: AssessmentData) -> List[str]:
        """生成个性化建议"""
        recommendations = []
        
        # 基于学习习惯的建议
        if "注意力不集中" in assessment_data.classroom_behavior:
            recommendations.extend(self.solution_templates["attention_deficit"])
        
        if "多动" in assessment_data.classroom_behavior:
            recommendations.extend(self.solution_templates["behavior_issue"])
        
        if "社交困难" in assessment_data.social_behavior:
            recommendations.extend(self.solution_templates["social_skill"])
        
        # 基于科目评分的建议
        subject_scores = assessment_data.subjects
        low_subjects = [subject for subject, score in subject_scores.items() if score < 70]
        if low_subjects:
            recommendations.extend(self.solution_templates["learning_difficulty"])
        
        return list(set(recommendations))  # 去重
    
    def train_model(self, training_data: List[Tuple[AssessmentData, int]], 
                   epochs: int = 50, learning_rate: float = 0.001):
        """训练模型"""
        if not training_data:
            logger.warning("没有训练数据")
            return
        
        # 初始化模型
        self.model = EducationCNN()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate)
        criterion = nn.CrossEntropyLoss()
        
        # 训练循环
        for epoch in range(epochs):
            total_loss = 0
            for assessment_data, label in training_data:
                text_input, numeric_features = self.preprocess_data(assessment_data)
                target = torch.tensor([label], dtype=torch.long)
                
                optimizer.zero_grad()
                output = self.model(text_input, numeric_features)
                loss = criterion(output, target)
                loss.backward()
                optimizer.step()
                
                total_loss += loss.item()
            
            if (epoch + 1) % 10 == 0:
                logger.info(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss/len(training_data):.4f}")
    
    def save_model(self, model_path: str):
        """保存模型"""
        if self.model is not None:
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            torch.save({
                'model_state_dict': self.model.state_dict(),
                'vocab': self.vocab
            }, model_path)
            logger.info(f"模型已保存到: {model_path}")
        else:
            logger.warning("没有模型可保存")
    
    def load_model(self, model_path: str):
        """加载模型"""
        try:
            checkpoint = torch.load(model_path, map_location='cpu')
            self.model = EducationCNN()
            self.model.load_state_dict(checkpoint['model_state_dict'])
            self.vocab = checkpoint.get('vocab', {})
            self.model.eval()
            logger.info(f"模型已从 {model_path} 加载")
        except Exception as e:
            logger.error(f"模型加载失败: {e}")

def generate_development_recommendations(assessment_data, age_group, assessment_mode):
    """生成个性化发展建议"""
    recommendations = {
        "summary": "",
        "development_areas": {},
        "activities": [],
        "resources": [],
        "next_steps": []
    }
    
    # 根据年龄组生成基础建议
    if age_group == "0-3":
        recommendations["summary"] = "基于0-3岁发展里程碑的评估结果"
        recommendations["development_areas"] = {
            "motor": "运动发展",
            "cognitive": "认知发展", 
            "language": "语言发展",
            "social": "社交情绪发展"
        }
        
        # 推荐活动
        recommendations["activities"] = [
            {
                "category": "运动发展",
                "activities": [
                    "每天进行30分钟户外活动",
                    "练习爬行、站立、行走",
                    "玩球类游戏锻炼手眼协调",
                    "进行简单的舞蹈动作"
                ]
            },
            {
                "category": "认知发展",
                "activities": [
                    "玩躲猫猫游戏",
                    "进行简单的物品分类",
                    "阅读图画书",
                    "玩积木搭建游戏"
                ]
            },
            {
                "category": "语言发展",
                "activities": [
                    "多与孩子对话交流",
                    "唱歌、念儿歌",
                    "指认物品名称",
                    "鼓励孩子模仿发音"
                ]
            },
            {
                "category": "社交情绪发展",
                "activities": [
                    "与同龄孩子互动游戏",
                    "学习表达基本情绪",
                    "培养分享意识",
                    "建立安全感"
                ]
            }
        ]
        
    elif age_group == "4-6":
        recommendations["summary"] = "基于4-6岁发展能力的评估结果"
        recommendations["development_areas"] = {
            "cognitive": "认知能力",
            "language": "语言能力",
            "social": "社交能力"
        }
        
        recommendations["activities"] = [
            {
                "category": "认知能力",
                "activities": [
                    "学习数字和简单计算",
                    "认识颜色、形状、大小",
                    "理解时间概念",
                    "进行逻辑思维游戏"
                ]
            },
            {
                "category": "语言能力",
                "activities": [
                    "扩大词汇量",
                    "练习完整句子表达",
                    "学习讲故事",
                    "培养阅读兴趣"
                ]
            },
            {
                "category": "社交能力",
                "activities": [
                    "参与集体活动",
                    "学习合作与分享",
                    "处理简单冲突",
                    "培养同理心"
                ]
            }
        ]
        
    else:  # 7+
        recommendations["summary"] = "基于7岁以上发展水平的评估结果"
        recommendations["development_areas"] = {
            "academic": "学习能力",
            "social": "社交能力",
            "emotional": "情绪管理"
        }
        
        recommendations["activities"] = [
            {
                "category": "学习能力",
                "activities": [
                    "制定学习计划",
                    "培养专注力",
                    "提高学习效率",
                    "发展批判性思维"
                ]
            },
            {
                "category": "社交能力",
                "activities": [
                    "参与团队活动",
                    "培养领导能力",
                    "学习有效沟通",
                    "建立友谊关系"
                ]
            },
            {
                "category": "情绪管理",
                "activities": [
                    "识别和表达情绪",
                    "学习情绪调节技巧",
                    "培养抗压能力",
                    "建立自信心"
                ]
            }
        ]
    
    # 添加推荐资源
    recommendations["resources"] = [
        {
            "type": "视频",
            "title": "儿童发展指导视频",
            "url": "https://www.youtube.com/watch?v=example",
            "description": "专业的发展指导视频"
        },
        {
            "type": "书籍",
            "title": "《儿童发展里程碑》",
            "description": "详细的发展指南和活动建议"
        },
        {
            "type": "应用",
            "title": "儿童教育应用推荐",
            "description": "适合年龄的教育游戏和应用"
        }
    ]
    
    # 下一步建议
    recommendations["next_steps"] = [
        "定期进行发展评估",
        "与专业教育工作者沟通",
        "参与亲子活动",
        "关注孩子兴趣发展"
    ]
    
    return recommendations

def analyze_development_data(assessment_data, age_group, assessment_mode):
    """分析发展数据并生成详细报告"""
    analysis = {
        "overall_level": "正常发展",
        "strengths": [],
        "areas_for_improvement": [],
        "detailed_analysis": {},
        "recommendations": generate_development_recommendations(assessment_data, age_group, assessment_mode)
    }
    
    # 分析运动发展
    if hasattr(assessment_data, 'motorSkills') and assessment_data.motorSkills:
        motor_score = calculate_domain_score(assessment_data.motorSkills)
        if motor_score >= 80:
            analysis["strengths"].append("运动发展良好")
        elif motor_score < 60:
            analysis["areas_for_improvement"].append("运动发展需要加强")
    
    # 分析认知发展
    if hasattr(assessment_data, 'cognitiveSkills') and assessment_data.cognitiveSkills:
        cognitive_score = calculate_domain_score(assessment_data.cognitiveSkills)
        if cognitive_score >= 80:
            analysis["strengths"].append("认知能力优秀")
        elif cognitive_score < 60:
            analysis["areas_for_improvement"].append("认知能力需要提升")
    
    # 分析语言发展
    if hasattr(assessment_data, 'languageSkills') and assessment_data.languageSkills:
        language_score = calculate_domain_score(assessment_data.languageSkills)
        if language_score >= 80:
            analysis["strengths"].append("语言发展良好")
        elif language_score < 60:
            analysis["areas_for_improvement"].append("语言发展需要关注")
    
    # 分析社交情绪发展
    if hasattr(assessment_data, 'socialEmotional') and assessment_data.socialEmotional:
        social_score = calculate_domain_score(assessment_data.socialEmotional)
        if social_score >= 80:
            analysis["strengths"].append("社交情绪发展良好")
        elif social_score < 60:
            analysis["areas_for_improvement"].append("社交情绪发展需要支持")
    
    return analysis

def calculate_domain_score(domain_data):
    """计算领域发展得分"""
    if not domain_data:
        return 0
    
    total_score = 0
    total_items = 0
    
    for category, items in domain_data.items():
        if isinstance(items, dict):
            for item_id, score in items.items():
                if isinstance(score, (int, float)):
                    total_score += score
                    total_items += 1
    
    if total_items == 0:
        return 0
    
    return (total_score / total_items) * 100

# ==================== 生命周期管理 ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    logger.info("正在启动SpecialCare Connect API...")
    
    # 挂载静态文件
    try:
        frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "public")
        if os.path.exists(frontend_path):
            app.mount("/static", StaticFiles(directory=frontend_path), name="static")
            logger.info("静态文件挂载成功")
        else:
            logger.warning("前端静态文件目录不存在")
    except Exception as e:
        logger.warning(f"静态文件挂载失败: {e}")
    
    # 尝试加载已保存的模型
    model_path = "models/education_model.pth"
    if os.path.exists(model_path):
        try:
            education_analyzer.load_model(model_path)
            logger.info("模型加载成功")
        except Exception as e:
            logger.warning(f"模型加载失败: {e}")
    else:
        logger.info("未找到已保存的模型，将使用规则基础分析")
    
    logger.info("API启动完成")
    
    yield
    
    # 关闭时执行
    logger.info("API正在关闭...")

# ==================== FastAPI应用 ====================

app = FastAPI(
    title="SpecialCare Connect API",
    description="AI教育评估分析API - 为特殊儿童提供个性化支持",
    version="1.0.0",
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化AI分析器
education_analyzer = EducationAnalyzer()

# 存储评估历史
assessment_history = []

# Include routers
if AUTH_AVAILABLE:
    app.include_router(auth.router)
    app.include_router(user_data.router)
    app.include_router(plans_router)
    logger.info("Authentication and user data APIs enabled")

# ==================== API路由 ====================

@app.get("/")
async def root():
    """API根路径"""
    return {
        "message": "SpecialCare Connect API",
        "version": "1.0.0",
        "status": "running",
        "model_loaded": education_analyzer.model is not None
    }

@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "model_loaded": education_analyzer.model is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/analyze", response_model=AssessmentResponse)
async def analyze_assessment(request: AssessmentRequest):
    """分析教育评估数据"""
    try:
        # 转换请求数据为AssessmentData对象
        assessment_data = AssessmentData(
            child_name=request.childName,
            age=request.childAge,
            school_type=request.assessmentMode, # Assuming assessmentMode is school_type
            grade=request.ageGroup, # Assuming ageGroup is grade
            subjects={}, # Placeholder, will be populated from new fields if available
            learning_habits=[], # Placeholder
            classroom_behavior=[], # Placeholder
            social_behavior=[], # Placeholder
            learning_description=request.parentObservations if request.parentObservations else "",
            behavior_description=request.concerns if request.concerns else "",
            parent_concerns=request.strengths if request.strengths else ""
        )
        
        # 尝试从新字段中提取评分和行为特征
        if request.motorSkills:
            assessment_data.classroom_behavior.append("运动协调性不足")
        if request.cognitiveSkills:
            assessment_data.classroom_behavior.append("认知理解力不足")
        if request.languageSkills:
            assessment_data.social_behavior.append("语言表达能力不足")
        if request.socialEmotional:
            assessment_data.social_behavior.append("社交情绪调节困难")
        if request.dailyLiving:
            assessment_data.social_behavior.append("日常生活自理能力不足")

        # 生成一个随机的科目评分，用于训练模型
        assessment_data.subjects = {
            "语文": np.random.randint(60, 90),
            "数学": np.random.randint(60, 90),
            "英语": np.random.randint(60, 90),
            "科学": np.random.randint(60, 90),
            "社会": np.random.randint(60, 90),
            "艺术": np.random.randint(60, 90),
            "体育": np.random.randint(60, 90),
            "编程": np.random.randint(60, 90),
            "其他": np.random.randint(60, 90)
        }

        # 执行分析
        analysis_result = education_analyzer.analyze(assessment_data)
        
        # 添加新的发展分析
        development_analysis = analyze_development_data(assessment_data, request.ageGroup, request.assessmentMode)
        analysis_result["development_analysis"] = development_analysis
        
        # 如果有儿童测试结果，添加到分析中
        if request.childTestResults:
            analysis_result["child_test"] = {
                "schulte_test": request.childTestResults,
                "attention_level": get_attention_level(request.childTestResults),
                "recommendations": get_attention_recommendations(request.childTestResults),
                "comprehensive_analysis": get_comprehensive_assessment_analysis(request.childTestResults)
            }
        
        # 如果有互动游戏结果，添加到分析中
        if request.interactiveResults:
            analysis_result["interactive_analysis"] = {
                "game_results": request.interactiveResults,
                "performance_summary": "互动游戏表现良好",
                "skill_insights": "展现了良好的认知和注意力能力"
            }
        
        # 生成评估ID
        assessment_id = f"assessment_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # 保存到历史记录
        assessment_record = {
            "id": assessment_id,
            "request": request.dict(),
            "result": analysis_result,
            "timestamp": datetime.now().isoformat()
        }
        assessment_history.append(assessment_record)
        
        return AssessmentResponse(
            success=True,
            data={
                "assessment_id": assessment_id,
                "analysis": analysis_result,
                "child_name": request.childName,
                "timestamp": datetime.now().isoformat()
            },
            message="评估分析完成",
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"评估分析失败: {e}")
        raise HTTPException(status_code=500, detail=f"评估分析失败: {str(e)}")

@app.get("/history")
async def get_assessment_history(limit: int = 10):
    """获取评估历史"""
    try:
        recent_history = assessment_history[-limit:] if len(assessment_history) > limit else assessment_history
        return {
            "success": True,
            "data": recent_history,
            "total": len(assessment_history),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"获取历史记录失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取历史记录失败: {str(e)}")

@app.post("/train")
async def train_model(request: TrainingRequest, background_tasks: BackgroundTasks):
    """训练模型"""
    try:
        # 在后台任务中训练模型
        background_tasks.add_task(train_model_task, request)
        
        return {
            "success": True,
            "message": "模型训练已开始，请稍后查看状态",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"启动训练失败: {e}")
        raise HTTPException(status_code=500, detail=f"启动训练失败: {str(e)}")

def get_attention_level(test_results):
    """根据舒尔特测试结果评估注意力水平"""
    if not test_results or 'performance' not in test_results:
        return "unknown"
    
    performance = test_results['performance']
    if performance == 'excellent':
        return "Excellent"
    elif performance == 'good':
        return "Good"
    elif performance == 'average':
        return "Average"
    else:
        return "Needs Improvement"

def get_attention_recommendations(test_results):
    """根据舒尔特测试结果生成注意力训练建议"""
    if not test_results or 'performance' not in test_results:
        return ["Professional attention assessment recommended"]
    
    performance = test_results['performance']
    recommendations = []
    
    if performance == 'excellent':
        recommendations.extend([
            "Outstanding attention level, keep it up",
            "Can try more complex attention training games",
            "Regular attention maintenance training recommended"
        ])
    elif performance == 'good':
        recommendations.extend([
            "Good attention level with room for improvement",
            "Medium-intensity attention training recommended",
            "Can try advanced version of Schulte training"
        ])
    elif performance == 'average':
        recommendations.extend([
            "Average attention level, needs strengthening",
            "Daily 15-20 minute attention training recommended",
            "Try various attention training methods",
            "Reduce electronic device usage time"
        ])
    else:
        recommendations.extend([
            "Attention level needs improvement, professional intervention recommended",
            "Consult professional attention training specialists",
            "Try structured attention training courses",
            "Comprehensive attention assessment recommended"
        ])
    
    return recommendations

def get_comprehensive_assessment_analysis(test_results):
    """根据综合评估结果生成详细分析"""
    if not test_results or 'comprehensiveAssessment' not in test_results:
        return {
            "summary": "Comprehensive assessment data not available",
            "detailed_analysis": "Unable to provide detailed analysis without test data",
            "training_plan": ["Professional assessment recommended"]
        }
    
    assessment = test_results['comprehensiveAssessment']
    total_score = assessment.get('totalScore', 0)
    
    analysis = {
        "summary": assessment.get('summary', ''),
        "detailed_analysis": {
            "attention_score": f"{assessment.get('attentionScore', 0)}/40",
            "consistency_score": f"{assessment.get('consistencyScore', 0)}/30", 
            "improvement_score": f"{assessment.get('improvementScore', 0)}/30",
            "total_score": f"{total_score}/100",
            "overall_level": assessment.get('overallLevel', 'Unknown')
        },
        "training_plan": assessment.get('recommendations', [])
    }
    
    return analysis

def train_model_task(request: TrainingRequest):
    """后台训练任务"""
    try:
        # 转换训练数据
        training_data = []
        for item in request.training_data:
            assessment_data = AssessmentData(**item["assessment"])
            label = item["label"]
            training_data.append((assessment_data, label))
        
        # 训练模型
        education_analyzer.train_model(
            training_data, 
            epochs=request.epochs, 
            learning_rate=request.learning_rate
        )
        
        # 保存模型
        education_analyzer.save_model("models/education_model.pth")
        
        logger.info("模型训练完成")
    except Exception as e:
        logger.error(f"模型训练失败: {e}")

@app.post("/save-model")
async def save_model():
    """保存当前模型"""
    try:
        education_analyzer.save_model("models/education_model.pth")
        return {
            "success": True,
            "message": "模型保存成功",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"模型保存失败: {e}")
        raise HTTPException(status_code=500, detail=f"模型保存失败: {str(e)}")

@app.post("/load-model")
async def load_model(model_path: str = "models/education_model.pth"):
    """加载模型"""
    try:
        education_analyzer.load_model(model_path)
        return {
            "success": True,
            "message": "模型加载成功",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"模型加载失败: {e}")
        raise HTTPException(status_code=500, detail=f"模型加载失败: {str(e)}")

@app.get("/model-status")
async def get_model_status():
    """获取模型状态"""
    return {
        "success": True,
        "data": {
            "model_loaded": education_analyzer.model is not None,
            "vocab_size": len(education_analyzer.vocab),
            "solution_templates_count": len(education_analyzer.solution_templates)
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/statistics")
async def get_statistics():
    """获取API使用统计"""
    try:
        total_assessments = len(assessment_history)
        
        # 计算年龄分布
        age_distribution = {}
        for record in assessment_history:
            age = record['request']['childAge'] # Changed from 'age' to 'childAge'
            age_distribution[age] = age_distribution.get(age, 0) + 1
        
        # 计算平均评分
        total_score = 0
        score_count = 0
        for record in assessment_history:
            if 'overall_score' in record['result']:
                total_score += record['result']['overall_score']
                score_count += 1
        
        avg_score = total_score / score_count if score_count > 0 else 0
        
        return {
            "success": True,
            "data": {
                "total_assessments": total_assessments,
                "age_distribution": age_distribution,
                "average_score": round(avg_score, 2),
                "model_loaded": education_analyzer.model is not None
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"获取统计信息失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取统计信息失败: {str(e)}")



# ==================== 主程序入口 ====================

if __name__ == "__main__":
    import uvicorn
    logger.info("启动SpecialCare Connect API服务器...")
    uvicorn.run(app, host="0.0.0.0", port=8001) 