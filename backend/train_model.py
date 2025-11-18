#!/usr/bin/env python3
"""
AI教育评估模型训练脚本
"""

import json
import random
import numpy as np
from typing import List, Tuple
from ai_model import AssessmentData, education_analyzer

def generate_sample_data(num_samples: int = 1000) -> List[Tuple[AssessmentData, int]]:
    """生成示例训练数据"""
    
    # 预定义的行为模式
    learning_habits_options = [
        ['attention'], ['homework'], ['memory'], ['motivation'],
        ['attention', 'homework'], ['memory', 'motivation'],
        ['attention', 'memory'], ['homework', 'motivation'],
        ['attention', 'homework', 'memory'], ['memory', 'motivation', 'homework']
    ]
    
    classroom_behavior_options = [
        ['talking'], ['movement'], ['participation'],
        ['talking', 'movement'], ['participation', 'talking'],
        ['movement', 'participation'], ['talking', 'movement', 'participation']
    ]
    
    social_behavior_options = [
        ['friends'], ['communication'], ['confidence'],
        ['friends', 'communication'], ['communication', 'confidence'],
        ['friends', 'confidence'], ['friends', 'communication', 'confidence']
    ]
    
    school_types = ['public', 'private', 'international', 'homeschool']
    
    # 生成描述性文本模板
    learning_descriptions = [
        "孩子在学习时经常分心，需要多次提醒才能完成任务。",
        "作业完成质量较高，但速度较慢，需要更多时间。",
        "记忆力很好，能够快速掌握新知识。",
        "学习积极性不高，需要外部激励才能完成任务。",
        "注意力集中，能够长时间专注于学习任务。",
        "学习效率较高，能够独立完成大部分作业。",
        "需要家长监督才能完成学习任务。",
        "对学习有浓厚兴趣，主动探索新知识。"
    ]
    
    behavior_descriptions = [
        "在课堂上比较安静，很少主动发言。",
        "上课时经常与同学说话，影响课堂秩序。",
        "积极参与课堂活动，经常举手回答问题。",
        "坐不住，经常在座位上动来动去。",
        "遵守课堂纪律，认真听讲。",
        "有时会走神，需要老师提醒。",
        "与同学相处融洽，乐于帮助他人。",
        "比较内向，不太主动与同学交流。"
    ]
    
    parent_concerns = [
        "担心孩子的学习进度跟不上同龄人。",
        "希望提高孩子的学习效率。",
        "希望改善孩子的课堂表现。",
        "担心孩子的社交能力发展。",
        "希望培养孩子的学习兴趣。",
        "希望提高孩子的注意力水平。",
        "担心孩子的自信心不足。",
        "希望改善孩子的学习习惯。"
    ]
    
    training_data = []
    
    for i in range(num_samples):
        # 随机生成基本信息
        age = random.randint(3, 12)
        school_type = random.choice(school_types)
        
        # 根据年龄确定年级
        if age <= 6:
            grade = f"幼儿园{age-2}班" if age > 2 else "托班"
        else:
            grade = f"小学{age-5}年级"
        
        # 生成科目评分
        subjects = {
            'chinese': random.randint(1, 5),
            'math': random.randint(1, 5),
            'english': random.randint(1, 5),
            'science': random.randint(1, 5),
            'art': random.randint(1, 5)
        }
        
        # 随机选择行为模式
        learning_habits = random.choice(learning_habits_options)
        classroom_behavior = random.choice(classroom_behavior_options)
        social_behavior = random.choice(social_behavior_options)
        
        # 生成描述文本
        learning_description = random.choice(learning_descriptions)
        behavior_description = random.choice(behavior_descriptions)
        parent_concern = random.choice(parent_concerns)
        
        # 创建评估数据
        assessment_data = AssessmentData(
            child_name=f"Child_{i+1}",
            age=age,
            school_type=school_type,
            grade=grade,
            subjects=subjects,
            learning_habits=learning_habits,
            classroom_behavior=classroom_behavior,
            social_behavior=social_behavior,
            learning_description=learning_description,
            behavior_description=behavior_description,
            parent_concerns=parent_concern
        )
        
        # 生成标签（基于问题严重程度）
        label = 0  # 默认标签
        
        # 根据行为模式确定标签
        if 'attention' in learning_habits and 'talking' in classroom_behavior:
            label = 1  # 注意力问题
        elif 'homework' in learning_habits and 'movement' in classroom_behavior:
            label = 2  # 作业问题
        elif 'friends' in social_behavior and 'communication' in social_behavior:
            label = 3  # 社交问题
        elif 'motivation' in learning_habits:
            label = 4  # 动力问题
        elif all(score >= 4 for score in subjects.values()):
            label = 5  # 表现良好
        
        training_data.append((assessment_data, label))
    
    return training_data

def save_training_data(training_data: List[Tuple[AssessmentData, int]], 
                      filepath: str = "training_data.json"):
    """保存训练数据到文件"""
    
    data_to_save = []
    for assessment_data, label in training_data:
        data_item = {
            'child_name': assessment_data.child_name,
            'age': assessment_data.age,
            'school_type': assessment_data.school_type,
            'grade': assessment_data.grade,
            'subjects': assessment_data.subjects,
            'learning_habits': assessment_data.learning_habits,
            'classroom_behavior': assessment_data.classroom_behavior,
            'social_behavior': assessment_data.social_behavior,
            'learning_description': assessment_data.learning_description,
            'behavior_description': assessment_data.behavior_description,
            'parent_concerns': assessment_data.parent_concerns,
            'label': label
        }
        data_to_save.append(data_item)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data_to_save, f, ensure_ascii=False, indent=2)
    
    print(f"训练数据已保存到: {filepath}")

def load_training_data(filepath: str = "training_data.json") -> List[Tuple[AssessmentData, int]]:
    """从文件加载训练数据"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    training_data = []
    for item in data:
        assessment_data = AssessmentData(
            child_name=item['child_name'],
            age=item['age'],
            school_type=item['school_type'],
            grade=item['grade'],
            subjects=item['subjects'],
            learning_habits=item['learning_habits'],
            classroom_behavior=item['classroom_behavior'],
            social_behavior=item['social_behavior'],
            learning_description=item['learning_description'],
            behavior_description=item['behavior_description'],
            parent_concerns=item['parent_concerns']
        )
        training_data.append((assessment_data, item['label']))
    
    return training_data

def main():
    """主训练函数"""
    print("开始AI教育评估模型训练...")
    
    # 生成或加载训练数据
    try:
        training_data = load_training_data()
        print(f"从文件加载了 {len(training_data)} 条训练数据")
    except FileNotFoundError:
        print("未找到训练数据文件，正在生成示例数据...")
        training_data = generate_sample_data(1000)
        save_training_data(training_data)
        print(f"生成了 {len(training_data)} 条示例训练数据")
    
    # 训练模型
    print("开始训练模型...")
    education_analyzer.train_model(
        training_data=training_data,
        epochs=50,
        learning_rate=0.001
    )
    
    # 保存模型
    print("保存训练好的模型...")
    education_analyzer.save_model("models/education_model.pth")
    
    print("模型训练完成！")
    
    # 测试模型
    print("测试模型...")
    test_data = training_data[0][0]  # 使用第一条数据测试
    result = education_analyzer.analyze_assessment(test_data)
    
    print("测试结果:")
    print(f"总体评分: {result['overall_score']}")
    print(f"识别问题: {result['problems']}")
    print(f"解决方案: {result['solutions'][:3]}...")  # 只显示前3个
    print(f"置信度: {result['confidence']}")

if __name__ == "__main__":
    main() 