#!/usr/bin/env python3
"""
智能依赖安装脚本
自动检测Python版本并安装兼容的依赖包
"""

import sys
import subprocess
import platform
import os

def get_python_version():
    """获取Python版本信息"""
    version = sys.version_info
    return f"{version.major}.{version.minor}.{version.micro}"

def get_system_info():
    """获取系统信息"""
    return {
        'platform': platform.system(),
        'architecture': platform.architecture()[0],
        'python_version': get_python_version(),
        'is_windows': platform.system() == 'Windows'
    }

def install_pytorch():
    """根据系统信息安装合适的PyTorch版本"""
    system_info = get_system_info()
    python_version = system_info['python_version']
    is_windows = system_info['is_windows']
    
    print(f"🐍 Python版本: {python_version}")
    print(f"💻 操作系统: {system_info['platform']}")
    print(f"🏗️  架构: {system_info['architecture']}")
    
    # 根据Python版本选择合适的PyTorch安装命令
    if python_version.startswith('3.12'):
        print("📦 检测到Python 3.12，安装最新版PyTorch...")
        torch_command = "pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu"
    elif python_version.startswith('3.11'):
        print("📦 检测到Python 3.11，安装兼容版PyTorch...")
        torch_command = "pip install torch>=2.2.0 torchvision>=0.17.0"
    elif python_version.startswith('3.10'):
        print("📦 检测到Python 3.10，安装兼容版PyTorch...")
        torch_command = "pip install torch>=2.1.0 torchvision>=0.16.0"
    else:
        print("📦 安装最新版PyTorch...")
        torch_command = "pip install torch torchvision"
    
    try:
        print(f"🔧 执行命令: {torch_command}")
        result = subprocess.run(torch_command.split(), check=True, capture_output=True, text=True)
        print("✅ PyTorch安装成功")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ PyTorch安装失败: {e.stderr}")
        return False

def install_other_dependencies():
    """安装其他依赖包"""
    dependencies = [
        "fastapi>=0.104.0",
        "uvicorn[standard]>=0.24.0",
        "pydantic>=2.5.0",
        "numpy>=1.24.0",
        "scikit-learn>=1.3.0",
        "transformers>=4.35.0",
        "datasets>=2.14.0",
        "requests>=2.25.0"
    ]
    
    print("📦 安装其他依赖包...")
    
    for dep in dependencies:
        try:
            print(f"🔧 安装 {dep}...")
            result = subprocess.run(["pip", "install", dep], check=True, capture_output=True, text=True)
            print(f"✅ {dep} 安装成功")
        except subprocess.CalledProcessError as e:
            print(f"❌ {dep} 安装失败: {e.stderr}")
            return False
    
    return True

def verify_installation():
    """验证安装是否成功"""
    print("🔍 验证安装...")
    
    try:
        # 测试导入PyTorch
        import torch
        print(f"✅ PyTorch {torch.__version__} 导入成功")
        
        # 测试导入FastAPI
        import fastapi
        print(f"✅ FastAPI {fastapi.__version__} 导入成功")
        
        # 测试导入其他包
        import numpy as np
        print(f"✅ NumPy {np.__version__} 导入成功")
        
        import sklearn
        print(f"✅ Scikit-learn {sklearn.__version__} 导入成功")
        
        return True
    except ImportError as e:
        print(f"❌ 导入失败: {e}")
        return False

def create_requirements_file():
    """创建更新后的requirements.txt文件"""
    print("📝 创建requirements.txt文件...")
    
    requirements_content = """# AI教育评估系统依赖包
# 自动生成的requirements.txt文件

# Web框架
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
pydantic>=2.5.0

# 深度学习
torch>=2.2.0
torchvision>=0.17.0

# 数据处理
numpy>=1.24.0
scikit-learn>=1.3.0
transformers>=4.35.0
datasets>=2.14.0

# 工具包
requests>=2.25.0
python-multipart>=0.0.6
python-dotenv>=1.0.0

# 测试
pytest>=7.4.0
pytest-asyncio>=0.21.0
"""
    
    try:
        with open("backend/requirements.txt", "w", encoding="utf-8") as f:
            f.write(requirements_content)
        print("✅ requirements.txt文件已更新")
        return True
    except Exception as e:
        print(f"❌ 创建requirements.txt失败: {e}")
        return False

def main():
    """主函数"""
    print("🎓 AI教育评估系统 - 依赖安装")
    print("=" * 50)
    
    # 检查Python版本
    python_version = get_python_version()
    if not python_version.startswith('3.'):
        print("❌ 需要Python 3.x版本")
        return False
    
    # 升级pip
    print("🔄 升级pip...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], check=True)
        print("✅ pip升级成功")
    except subprocess.CalledProcessError:
        print("⚠️  pip升级失败，继续安装...")
    
    # 安装PyTorch
    if not install_pytorch():
        print("❌ PyTorch安装失败")
        return False
    
    # 安装其他依赖
    if not install_other_dependencies():
        print("❌ 其他依赖安装失败")
        return False
    
    # 验证安装
    if not verify_installation():
        print("❌ 安装验证失败")
        return False
    
    # 创建requirements文件
    create_requirements_file()
    
    print("\n🎉 所有依赖安装完成！")
    print("💡 现在可以运行: python start_ai_system.py")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1) 