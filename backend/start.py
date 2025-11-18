#!/usr/bin/env python3
"""
SpecialCare Connect - 启动脚本
一键启动后端API服务
"""

import os
import sys
import subprocess
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_dependencies():
    """检查依赖项"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'torch',
        'numpy',
        'pydantic'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    # Check for email-validator specifically (needed for EmailStr)
    try:
        import email_validator
    except ImportError:
        logger.warning("email-validator not found, trying to install...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "email-validator"], 
                         check=True, capture_output=True)
            logger.info("email-validator installed successfully")
        except Exception as e:
            logger.error(f"Failed to install email-validator: {e}")
            missing_packages.append('email-validator')
    
    if missing_packages:
        logger.error(f"缺少依赖包: {', '.join(missing_packages)}")
        logger.info("请运行: pip install -r requirements.txt")
        return False
    
    return True

def create_directories():
    """创建必要的目录"""
    directories = ['models', 'feedback', 'data']
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"确保目录存在: {directory}")

def start_server():
    """启动服务器"""
    try:
        logger.info("正在启动SpecialCare Connect API服务器...")
        logger.info("服务器地址: http://localhost:8001")
        logger.info("API文档: http://localhost:8001/docs")
        logger.info("按 Ctrl+C 停止服务器")
        
        # 启动服务器
        subprocess.run([
            sys.executable, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"
        ], check=True)
        
    except KeyboardInterrupt:
        logger.info("服务器已停止")
    except Exception as e:
        logger.error(f"启动服务器失败: {e}")
        return False
    
    return True

def main():
    """主函数"""
    logger.info("=== SpecialCare Connect 启动器 ===")
    
    # 检查依赖
    if not check_dependencies():
        return 1
    
    # 创建目录
    create_directories()
    
    # 启动服务器
    if not start_server():
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 