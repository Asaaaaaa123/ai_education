#!/usr/bin/env python3
"""
简化版AI教育评估模型
使用scikit-learn进行机器学习分析，不依赖PyTorch
"""

import numpy as np
import json
import pickle
import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime
import os

# 尝试导入scikit-learn
try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.preprocessing import StandardScaler
    from sklearn.pipeline import Pipeline
    from sklearn.model_selection import train_test_split
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("⚠️  scikit-learn未安装，将使用规则基础分析")

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

class SimpleEducationAnalyzer:
    """简化版教育评估分析器"""
    
    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        self.text_vectorizer = None
        self.scaler = None
        self.is_trained = False
        
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
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
    
    def preprocess_data(self, assessment_data: AssessmentData) -> Tuple[np.ndarray, np.ndarray]:
        """预处理评估数据"""
        # 文本特征处理
        text_content = f"{assessment_data.learning_description} {assessment_data.behavior_description} {assessment_data.parent_concerns}"
        
        # 数值特征处理
        numeric_features = np.zeros(20)
        
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
        
        return text_content, numeric_features
    
    def analyze_assessment(self, assessment_data: AssessmentData) -> Dict:
        """分析评估数据并生成建议"""
        try:
            # 预处理数据
            text_content, numeric_features = self.preprocess_data(assessment_data)
            
            # 如果没有训练好的模型，使用规则基础分析
            if not self.is_trained or not SKLEARN_AVAILABLE:
                return self._rule_based_analysis(assessment_data)
            
            # 使用机器学习模型进行预测
            # 这里简化处理，实际项目中可以添加更复杂的预测逻辑
            prediction = self._predict_with_model(text_content, numeric_features)
            
            # 生成分析结果
            return self._generate_analysis_result(assessment_data, prediction)
            
        except Exception as e:
            logger.error(f"分析过程中出现错误: {e}")
            return self._rule_based_analysis(assessment_data)
    
    def _predict_with_model(self, text_content: str, numeric_features: np.ndarray) -> float:
        """使用模型进行预测"""
        try:
            # 文本特征提取
            if self.text_vectorizer:
                text_features = self.text_vectorizer.transform([text_content])
            else:
                text_features = np.zeros((1, 100))  # 默认特征维度
            
            # 数值特征处理
            if self.scaler:
                numeric_features_scaled = self.scaler.transform([numeric_features])
            else:
                numeric_features_scaled = [numeric_features]
            
            # 特征融合（简化版）
            combined_features = np.concatenate([text_features.toarray(), numeric_features_scaled], axis=1)
            
            # 预测
            if self.model:
                prediction = self.model.predict_proba(combined_features)[0]
                return np.max(prediction)  # 返回最高概率
            else:
                return 0.7  # 默认置信度
            
        except Exception as e:
            logger.error(f"模型预测失败: {e}")
            return 0.7
    
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
            'confidence': 0.7,  # 规则基础分析的置信度
            'analysis_method': 'rule_based'
        }
    
    def _generate_analysis_result(self, assessment_data: AssessmentData, 
                                prediction: float) -> Dict:
        """基于模型预测生成分析结果"""
        # 使用规则基础分析作为基础
        base_result = self._rule_based_analysis(assessment_data)
        
        # 根据模型置信度调整结果
        base_result['confidence'] = prediction
        base_result['analysis_method'] = 'ml_model'
        
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
        if not SKLEARN_AVAILABLE:
            logger.warning("scikit-learn未安装，跳过模型训练")
            return
        
        if not training_data:
            logger.warning("没有训练数据")
            return
        
        try:
            # 准备训练数据
            texts = []
            numeric_features = []
            labels = []
            
            for assessment_data, label in training_data:
                text_content, numeric_feature = self.preprocess_data(assessment_data)
                texts.append(text_content)
                numeric_features.append(numeric_feature)
                labels.append(label)
            
            # 文本特征提取
            self.text_vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
            text_features = self.text_vectorizer.fit_transform(texts)
            
            # 数值特征标准化
            self.scaler = StandardScaler()
            numeric_features_scaled = self.scaler.fit_transform(numeric_features)
            
            # 特征融合
            combined_features = np.concatenate([text_features.toarray(), numeric_features_scaled], axis=1)
            
            # 训练随机森林模型
            self.model = RandomForestClassifier(n_estimators=100, random_state=42)
            self.model.fit(combined_features, labels)
            
            self.is_trained = True
            logger.info("模型训练完成")
            
        except Exception as e:
            logger.error(f"模型训练失败: {e}")
            self.is_trained = False
    
    def save_model(self, model_path: str):
        """保存模型"""
        if not self.is_trained:
            logger.warning("模型未训练，无法保存")
            return
        
        try:
            model_data = {
                'model': self.model,
                'text_vectorizer': self.text_vectorizer,
                'scaler': self.scaler,
                'is_trained': self.is_trained,
                'save_time': datetime.now().isoformat()
            }
            
            with open(model_path, 'wb') as f:
                pickle.dump(model_data, f)
            
            logger.info(f"模型已保存到: {model_path}")
        except Exception as e:
            logger.error(f"保存模型失败: {e}")
    
    def load_model(self, model_path: str):
        """加载模型"""
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            self.model = model_data['model']
            self.text_vectorizer = model_data['text_vectorizer']
            self.scaler = model_data['scaler']
            self.is_trained = model_data['is_trained']
            
            logger.info(f"模型已从 {model_path} 加载")
        except Exception as e:
            logger.error(f"加载模型失败: {e}")
            self.is_trained = False

# 创建全局分析器实例
simple_education_analyzer = SimpleEducationAnalyzer() 