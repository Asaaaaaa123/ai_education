#!/usr/bin/env python3
"""
AI教育评估系统启动脚本
"""

import subprocess
import sys
import os
import time
import requests
import json
from pathlib import Path

def check_dependencies():
    """检查依赖是否安装"""
    try:
        import fastapi
        import uvicorn
        print("✅ 基础依赖已安装")
        
        # 检查AI模型依赖
        try:
            import torch
            print("✅ PyTorch已安装，将使用深度学习模型")
            return True
        except ImportError:
            try:
                import sklearn
                print("✅ scikit-learn已安装，将使用机器学习模型")
                return True
            except ImportError:
                print("⚠️  AI模型依赖未安装，将使用规则基础分析")
                return True
    except ImportError as e:
        print(f"❌ 缺少基础依赖: {e}")
        print("请运行: python install_dependencies.py")
        return False

def start_backend():
    """启动后端API服务"""
    print("🚀 启动AI后端服务...")
    
    # 启动FastAPI服务
    try:
        # 使用完整路径启动服务
        backend_dir = os.path.join(os.getcwd(), "backend")
        subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "api:app", 
            "--host", "0.0.0.0", 
            "--port", "8000",
            "--reload"
        ], cwd=backend_dir)
        print("✅ 后端服务启动成功 (http://localhost:8000)")
        return True
    except Exception as e:
        print(f"❌ 后端服务启动失败: {e}")
        return False

def start_frontend():
    """启动前端服务"""
    print("🌐 启动前端服务...")
    
    # 切换到根目录
    os.chdir("..")
    
    try:
        # 启动简单的HTTP服务器
        subprocess.Popen([
            sys.executable, "-m", "http.server", "8080"
        ])
        print("✅ 前端服务启动成功 (http://localhost:8080)")
        return True
    except Exception as e:
        print(f"❌ 前端服务启动失败: {e}")
        return False

def train_model():
    """训练AI模型"""
    print("🤖 训练AI模型...")
    
    try:
        # 切换到backend目录
        os.chdir("backend")
        
        # 运行训练脚本
        result = subprocess.run([
            sys.executable, "train_model.py"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ AI模型训练完成")
            return True
        else:
            print(f"❌ 模型训练失败: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ 模型训练失败: {e}")
        return False

def test_api():
    """测试API连接"""
    print("🔍 测试API连接...")
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API连接成功")
            print(f"   模型状态: {'已加载' if data.get('model_loaded') else '未加载'}")
            return True
        else:
            print(f"❌ API响应异常: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ API连接失败: {e}")
        return False

def show_system_info():
    """显示系统信息"""
    print("\n" + "="*50)
    print("🎓 AI教育评估系统")
    print("="*50)
    print("📋 系统功能:")
    print("   • 基于CNN的深度学习模型")
    print("   • 智能教育评估分析")
    print("   • 个性化建议生成")
    print("   • 实时API服务")
    print("   • 模型迭代升级")
    print("\n🌐 访问地址:")
    print("   • 前端界面: http://localhost:8080")
    print("   • API文档: http://localhost:8000/docs")
    print("   • API健康检查: http://localhost:8000/health")
    print("\n📁 文件结构:")
    print("   • backend/ - AI模型和API服务")
    print("   • frontend/ - React前端应用")
    print("   • models/ - 训练好的模型文件")
    print("   • feedback/ - 用户反馈数据")
    print("="*50)

def main():
    """主函数"""
    print("🎓 AI教育评估系统启动中...")
    
    # 检查依赖
    if not check_dependencies():
        return
    
    # 创建必要的目录
    os.makedirs("backend/models", exist_ok=True)
    os.makedirs("backend/feedback", exist_ok=True)
    
    # 检查是否有训练好的模型
    model_path = Path("backend/models/education_model.pth")
    if not model_path.exists():
        print("📝 未找到训练好的模型，开始训练...")
        if not train_model():
            print("⚠️  模型训练失败，将使用规则基础分析")
    else:
        print("✅ 找到已训练的模型")
    
    # 启动后端服务
    if not start_backend():
        return
    
    # 等待后端启动
    print("⏳ 等待后端服务启动...")
    time.sleep(3)
    
    # 测试API连接
    if not test_api():
        print("⚠️  API连接失败，但系统仍可运行")
    
    # 启动前端服务
    if not start_frontend():
        return
    
    # 显示系统信息
    show_system_info()
    
    print("\n🎉 系统启动完成！")
    print("💡 提示:")
    print("   • 按 Ctrl+C 停止服务")
    print("   • 访问 http://localhost:8080 开始使用")
    print("   • 查看 http://localhost:8000/docs 了解API")
    
    try:
        # 保持脚本运行
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 正在关闭系统...")
        print("✅ 系统已关闭")

if __name__ == "__main__":
    main() 