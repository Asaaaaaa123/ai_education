from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict, List, Optional
import json
import logging
from datetime import datetime
import os

# 尝试导入PyTorch版本的AI模型
try:
    from ai_model import AssessmentData, education_analyzer
    AI_MODEL_TYPE = "pytorch"
    print("✅ 使用PyTorch版本的AI模型")
except ImportError as e:
    print(f"⚠️  PyTorch模型导入失败: {e}")
    # 使用简化版模型
    from simple_ai_model import AssessmentData, simple_education_analyzer as education_analyzer
    AI_MODEL_TYPE = "sklearn"
    print("✅ 使用scikit-learn版本的AI模型")

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Education Assessment API",
    description="基于CNN的教育评估分析API",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class AssessmentRequest(BaseModel):
    child_name: str
    age: int
    school_type: str
    grade: str
    subjects: Dict[str, int]
    learning_habits: List[str]
    classroom_behavior: List[str]
    social_behavior: List[str]
    learning_description: str
    behavior_description: str
    parent_concerns: str

class AssessmentResponse(BaseModel):
    success: bool
    data: Dict
    message: str
    timestamp: str

class TrainingRequest(BaseModel):
    training_data: List[Dict]
    epochs: int = 50
    learning_rate: float = 0.001

# 存储评估历史
assessment_history = []

@app.get("/")
async def root():
    """API根路径"""
    return {
        "message": "AI Education Assessment API",
        "version": "1.0.0",
        "status": "running"
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
            child_name=request.child_name,
            age=request.age,
            school_type=request.school_type,
            grade=request.grade,
            subjects=request.subjects,
            learning_habits=request.learning_habits,
            classroom_behavior=request.classroom_behavior,
            social_behavior=request.social_behavior,
            learning_description=request.learning_description,
            behavior_description=request.behavior_description,
            parent_concerns=request.parent_concerns
        )
        
        # 使用AI模型分析
        analysis_result = education_analyzer.analyze_assessment(assessment_data)
        
        # 添加元数据
        analysis_result['child_name'] = request.child_name
        analysis_result['age'] = request.age
        analysis_result['grade'] = request.grade
        analysis_result['analysis_timestamp'] = datetime.now().isoformat()
        
        # 保存到历史记录
        assessment_history.append({
            'request': request.dict(),
            'result': analysis_result,
            'timestamp': datetime.now().isoformat()
        })
        
        # 限制历史记录数量
        if len(assessment_history) > 1000:
            assessment_history.pop(0)
        
        return AssessmentResponse(
            success=True,
            data=analysis_result,
            message="分析完成",
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"分析过程中出现错误: {e}")
        raise HTTPException(status_code=500, detail=f"分析失败: {str(e)}")

@app.get("/history")
async def get_assessment_history(limit: int = 10):
    """获取评估历史"""
    try:
        return {
            "success": True,
            "data": assessment_history[-limit:],
            "total": len(assessment_history),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"获取历史记录失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取历史记录失败: {str(e)}")

@app.post("/train")
async def train_model(request: TrainingRequest, background_tasks: BackgroundTasks):
    """训练AI模型"""
    try:
        # 转换训练数据
        training_data = []
        for item in request.training_data:
            assessment_data = AssessmentData(
                child_name=item.get('child_name', ''),
                age=item.get('age', 0),
                school_type=item.get('school_type', ''),
                grade=item.get('grade', ''),
                subjects=item.get('subjects', {}),
                learning_habits=item.get('learning_habits', []),
                classroom_behavior=item.get('classroom_behavior', []),
                social_behavior=item.get('social_behavior', []),
                learning_description=item.get('learning_description', ''),
                behavior_description=item.get('behavior_description', ''),
                parent_concerns=item.get('parent_concerns', '')
            )
            label = item.get('label', 0)
            training_data.append((assessment_data, label))
        
        # 在后台任务中训练模型
        background_tasks.add_task(
            education_analyzer.train_model,
            training_data,
            request.epochs,
            request.learning_rate
        )
        
        return {
            "success": True,
            "message": "模型训练已开始",
            "training_data_count": len(training_data),
            "epochs": request.epochs,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"训练模型失败: {e}")
        raise HTTPException(status_code=500, detail=f"训练失败: {str(e)}")

@app.post("/save-model")
async def save_model():
    """保存当前模型"""
    try:
        model_path = "models/education_model.pth"
        os.makedirs("models", exist_ok=True)
        
        education_analyzer.save_model(model_path)
        
        return {
            "success": True,
            "message": "模型保存成功",
            "model_path": model_path,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"保存模型失败: {e}")
        raise HTTPException(status_code=500, detail=f"保存失败: {str(e)}")

@app.post("/load-model")
async def load_model(model_path: str = "models/education_model.pth"):
    """加载模型"""
    try:
        education_analyzer.load_model(model_path)
        
        return {
            "success": True,
            "message": "模型加载成功",
            "model_path": model_path,
            "model_loaded": education_analyzer.model is not None,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"加载模型失败: {e}")
        raise HTTPException(status_code=500, detail=f"加载失败: {str(e)}")

@app.get("/model-status")
async def get_model_status():
    """获取模型状态"""
    return {
        "success": True,
        "data": {
            "model_loaded": education_analyzer.model is not None,
            "device": str(education_analyzer.device),
            "model_type": "EducationCNN" if education_analyzer.model else None,
            "solution_templates_count": len(education_analyzer.solution_templates)
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/feedback")
async def submit_feedback(assessment_id: str, feedback: Dict):
    """提交用户反馈用于模型改进"""
    try:
        # 这里可以保存用户反馈用于后续模型改进
        feedback_data = {
            "assessment_id": assessment_id,
            "feedback": feedback,
            "timestamp": datetime.now().isoformat()
        }
        
        # 保存反馈到文件（实际项目中应该使用数据库）
        feedback_file = "feedback/feedback.json"
        os.makedirs("feedback", exist_ok=True)
        
        try:
            with open(feedback_file, 'r', encoding='utf-8') as f:
                feedback_history = json.load(f)
        except FileNotFoundError:
            feedback_history = []
        
        feedback_history.append(feedback_data)
        
        with open(feedback_file, 'w', encoding='utf-8') as f:
            json.dump(feedback_history, f, ensure_ascii=False, indent=2)
        
        return {
            "success": True,
            "message": "反馈提交成功",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"提交反馈失败: {e}")
        raise HTTPException(status_code=500, detail=f"提交反馈失败: {str(e)}")

@app.get("/statistics")
async def get_statistics():
    """获取API使用统计"""
    try:
        total_assessments = len(assessment_history)
        
        # 计算年龄分布
        age_distribution = {}
        for record in assessment_history:
            age = record['request']['age']
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

# 启动时加载模型
@app.on_event("startup")
async def startup_event():
    """应用启动时的初始化"""
    logger.info("正在启动AI教育评估API...")
    
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 