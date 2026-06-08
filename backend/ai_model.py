import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import json
import pickle
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AssessmentData:
    """评估数据结构"""
    child_name: str
    age: int
    school_type: str
    grade: str
    subjects: Dict[str, int]  # 科目评分
    learning_habits: List[str]
    classroom_behavior: List[str]
    social_behavior: List[str]
    learning_description: str
    behavior_description: str
    parent_concerns: str

class EducationCNN(nn.Module):
    """基于CNN的教育评估分析模型"""
    
    def __init__(self, vocab_size: int = 10000, embedding_dim: int = 128, 
                 num_classes: int = 10, dropout: float = 0.3):
        super(EducationCNN, self).__init__()
        
        # 文本嵌入层
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        
        # CNN卷积层
        self.conv1 = nn.Conv1d(embedding_dim, 64, kernel_size=3, padding=1)
        self.conv2 = nn.Conv1d(64, 128, kernel_size=3, padding=1)
        self.conv3 = nn.Conv1d(128, 256, kernel_size=3, padding=1)
        
        # 批归一化层
        self.bn1 = nn.BatchNorm1d(64)
        self.bn2 = nn.BatchNorm1d(128)
        self.bn3 = nn.BatchNorm1d(256)
        
        # 池化层
        self.pool = nn.AdaptiveMaxPool1d(1)
        
        # 全连接层
        self.fc1 = nn.Linear(256 + 50, 512)  # 256来自CNN + 50来自数值特征
        self.fc2 = nn.Linear(512, 256)
        self.fc3 = nn.Linear(256, 128)
        self.fc4 = nn.Linear(128, num_classes)
        
        # Dropout层
        self.dropout = nn.Dropout(dropout)
        
        # 数值特征处理层
        self.numeric_fc = nn.Linear(20, 50)  # 处理年龄、评分等数值特征
        
    def forward(self, text_input, numeric_features):
        # 文本特征提取
        x = self.embedding(text_input)  # [batch_size, seq_len, embedding_dim]
        x = x.transpose(1, 2)  # [batch_size, embedding_dim, seq_len]
        
        # CNN特征提取
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        x = F.relu(self.bn3(self.conv3(x)))
        
        # 全局池化
        x = self.pool(x).squeeze(-1)  # [batch_size, 256]
        
        # 数值特征处理
        numeric_out = F.relu(self.numeric_fc(numeric_features))
        
        # 特征融合
        x = torch.cat([x, numeric_out], dim=1)
        
        # 全连接层
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = self.dropout(x)
        x = F.relu(self.fc3(x))
        x = self.dropout(x)
        x = self.fc4(x)
        
        return x

class EducationAnalyzer:
    """教育评估分析器"""
    
    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        self.tokenizer = None
        self.label_encoder = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # 预定义的解决方案模板
        self.solution_templates = {
            'attention': {
                'problem': '注意力不集中',
                'solutions': [
                    '建议使用番茄工作法，每次专注25分钟',
                    '减少环境干扰，创造安静的学习环境',
                    '使用视觉提醒工具，如计时器和任务清单',
                    '定期进行注意力训练游戏'
                ]
            },
            'homework': {
                'problem': '作业完成困难',
                'solutions': [
                    '制定详细的作业计划和时间表',
                    '将大任务分解为小步骤',
                    '建立奖励机制鼓励完成',
                    '寻求老师或同学的帮助'
                ]
            },
            'social': {
                'problem': '社交能力不足',
                'solutions': [
                    '参加小组活动和团队项目',
                    '练习主动与他人交流',
                    '学习倾听和表达技巧',
                    '参加社交技能训练课程'
                ]
            },
            'motivation': {
                'problem': '学习动力不足',
                'solutions': [
                    '设定明确的学习目标和奖励',
                    '发现孩子的兴趣点并融入学习',
                    '展示学习的实际应用价值',
                    '与孩子一起制定学习计划'
                ]
            }
        }
        
        if model_path:
            self.load_model(model_path)
    
    def preprocess_data(self, assessment_data: AssessmentData) -> Tuple[torch.Tensor, torch.Tensor]:
        """预处理评估数据"""
        # 文本特征处理
        text_content = f"{assessment_data.learning_description} {assessment_data.behavior_description} {assessment_data.parent_concerns}"
        
        # 简单的文本标记化（实际项目中应使用更复杂的tokenizer）
        words = text_content.lower().split()
        text_features = torch.zeros(100, dtype=torch.long)  # 固定长度序列
        
        for i, word in enumerate(words[:100]):
            text_features[i] = hash(word) % 10000  # 简单的哈希编码
        
        # 数值特征处理
        numeric_features = torch.zeros(20)
        
        # 年龄特征
        numeric_features[0] = assessment_data.age / 18.0  # 归一化年龄
        
        # 科目评分特征
        subject_scores = list(assessment_data.subjects.values())
        for i, score in enumerate(subject_scores[:5]):
            numeric_features[1 + i] = score / 5.0
        
        # 行为特征（one-hot编码）
        behavior_patterns = {
            'attention': 6, 'homework': 7, 'memory': 8, 'motivation': 9,
            'talking': 10, 'movement': 11, 'participation': 12,
            'friends': 13, 'communication': 14, 'confidence': 15
        }
        
        for behavior in assessment_data.learning_habits + assessment_data.classroom_behavior + assessment_data.social_behavior:
            if behavior in behavior_patterns:
                idx = behavior_patterns[behavior]
                numeric_features[idx] = 1.0
        
        # 学校类型特征
        school_types = {'public': 16, 'private': 17, 'international': 18, 'homeschool': 19}
        if assessment_data.school_type in school_types:
            numeric_features[school_types[assessment_data.school_type]] = 1.0
        
        return text_features.unsqueeze(0), numeric_features.unsqueeze(0)
    
    def analyze_assessment(self, assessment_data: AssessmentData) -> Dict:
        """分析评估数据并生成建议"""
        try:
            # 预处理数据
            text_features, numeric_features = self.preprocess_data(assessment_data)
            
            # 如果没有训练好的模型，使用规则基础分析
            if self.model is None:
                return self._rule_based_analysis(assessment_data)
            
            # 使用模型进行预测
            self.model.eval()
            with torch.no_grad():
                text_features = text_features.to(self.device)
                numeric_features = numeric_features.to(self.device)
                predictions = self.model(text_features, numeric_features)
                probabilities = F.softmax(predictions, dim=1)
            
            # 生成分析结果
            return self._generate_analysis_result(assessment_data, probabilities)
            
        except Exception as e:
            logger.error(f"分析过程中出现错误: {e}")
            return self._rule_based_analysis(assessment_data)
    
    def _rule_based_analysis(self, assessment_data: AssessmentData) -> Dict:
        """基于规则的分析（当模型不可用时）"""
        problems = []
        solutions = []
        
        # 分析学习习惯
        for habit in assessment_data.learning_habits:
            if habit in self.solution_templates:
                problems.append(self.solution_templates[habit]['problem'])
                solutions.extend(self.solution_templates[habit]['solutions'])
        
        # 分析课堂行为
        for behavior in assessment_data.classroom_behavior:
            if behavior == 'talking':
                problems.append('上课爱说话')
                solutions.extend([
                    '使用"举手发言"规则',
                    '提供适当的发言机会',
                    '使用非语言信号提醒'
                ])
            elif behavior == 'movement':
                problems.append('坐不住')
                solutions.extend([
                    '允许适当的身体活动',
                    '使用站立式学习桌',
                    '定期进行运动休息'
                ])
        
        # 分析社交行为
        for behavior in assessment_data.social_behavior:
            if behavior == 'friends':
                problems.append('朋友较少')
                solutions.extend([
                    '鼓励参加集体活动',
                    '培养共同兴趣爱好',
                    '练习社交技能'
                ])
        
        # 计算总体评分
        subject_scores = list(assessment_data.subjects.values())
        avg_score = sum(subject_scores) / len(subject_scores) if subject_scores else 0
        
        return {
            'overall_score': avg_score,
            'problems': list(set(problems)),
            'solutions': list(set(solutions)),
            'recommendations': self._generate_recommendations(assessment_data),
            'confidence': 0.7  # 规则基础分析的置信度
        }
    
    def _generate_analysis_result(self, assessment_data: AssessmentData, 
                                probabilities: torch.Tensor) -> Dict:
        """基于模型预测生成分析结果"""
        # 这里可以根据模型输出生成更精确的分析
        # 目前使用规则基础分析作为基础
        base_result = self._rule_based_analysis(assessment_data)
        
        # 根据模型置信度调整结果
        confidence = probabilities.max().item()
        base_result['confidence'] = confidence
        
        return base_result
    
    def _generate_recommendations(self, assessment_data: AssessmentData) -> List[str]:
        """生成个性化建议"""
        recommendations = []
        
        # 基于年龄的建议
        if assessment_data.age < 6:
            recommendations.append("建议通过游戏化学习提高兴趣")
            recommendations.append("注重基础技能培养，如注意力训练")
        elif assessment_data.age < 12:
            recommendations.append("建立良好的学习习惯和作息时间")
            recommendations.append("鼓励自主学习和问题解决能力")
        else:
            recommendations.append("培养独立思考和批判性思维")
            recommendations.append("建立长期学习目标和规划")
        
        # 基于学校类型的建议
        if assessment_data.school_type == 'homeschool':
            recommendations.append("制定灵活的学习计划，适应家庭环境")
            recommendations.append("增加社交机会，参加社区活动")
        
        # 基于科目表现的建议
        subject_scores = assessment_data.subjects
        if subject_scores.get('math', 0) < 3:
            recommendations.append("数学方面建议多做基础练习，培养逻辑思维")
        if subject_scores.get('chinese', 0) < 3:
            recommendations.append("语文方面建议多阅读，提高理解能力")
        
        return recommendations
    
    def train_model(self, training_data: List[Tuple[AssessmentData, int]], 
                   epochs: int = 50, learning_rate: float = 0.001):
        """训练模型"""
        if not training_data:
            logger.warning("没有训练数据")
            return
        
        # 初始化模型
        self.model = EducationCNN().to(self.device)
        optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate)
        criterion = nn.CrossEntropyLoss()
        
        logger.info("开始训练模型...")
        
        for epoch in range(epochs):
            total_loss = 0
            for assessment_data, label in training_data:
                # 预处理数据
                text_features, numeric_features = self.preprocess_data(assessment_data)
                text_features = text_features.to(self.device)
                numeric_features = numeric_features.to(self.device)
                label = torch.tensor([label], dtype=torch.long).to(self.device)
                
                # 前向传播
                optimizer.zero_grad()
                outputs = self.model(text_features, numeric_features)
                loss = criterion(outputs, label)
                
                # 反向传播
                loss.backward()
                optimizer.step()
                
                total_loss += loss.item()
            
            if (epoch + 1) % 10 == 0:
                logger.info(f"Epoch [{epoch+1}/{epochs}], Loss: {total_loss/len(training_data):.4f}")
        
        logger.info("模型训练完成")
    
    def save_model(self, model_path: str):
        """保存模型"""
        if self.model is not None:
            torch.save({
                'model_state_dict': self.model.state_dict(),
                'model_config': {
                    'vocab_size': 10000,
                    'embedding_dim': 128,
                    'num_classes': 10,
                    'dropout': 0.3
                }
            }, model_path)
            logger.info(f"模型已保存到: {model_path}")
    
    def load_model(self, model_path: str):
        """加载模型"""
        try:
            checkpoint = torch.load(model_path, map_location=self.device)
            config = checkpoint['model_config']
            
            self.model = EducationCNN(**config).to(self.device)
            self.model.load_state_dict(checkpoint['model_state_dict'])
            self.model.eval()
            
            logger.info(f"模型已从 {model_path} 加载")
        except Exception as e:
            logger.error(f"加载模型失败: {e}")
            self.model = None

# 创建全局分析器实例
education_analyzer = EducationAnalyzer() 