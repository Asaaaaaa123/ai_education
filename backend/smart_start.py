#!/usr/bin/env python3
"""
智能启动脚本 - 自动找到可用端口并启动服务
"""

import socket
import subprocess
import sys
import os
import logging
from typing import Optional

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_port(host: str, port: int) -> bool:
    """检查端口是否可用"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            result = s.connect_ex((host, port))
            return result != 0  # 0表示端口被占用
    except Exception:
        return False

def find_available_port(start_port: int = 8000, max_attempts: int = 20) -> Optional[int]:
    """查找可用端口"""
    for port in range(start_port, start_port + max_attempts):
        if check_port('localhost', port):
            return port
    return None

def update_frontend_proxy(port: int):
    """更新前端代理配置"""
    try:
        package_json_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "package.json")
        if os.path.exists(package_json_path):
            with open(package_json_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 更新代理配置
            import re
            updated_content = re.sub(
                r'"proxy":\s*"http://localhost:\d+"',
                f'"proxy": "http://localhost:{port}"',
                content
            )
            
            with open(package_json_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            
            logger.info(f"✅ 前端代理已更新为: http://localhost:{port}")
    except Exception as e:
        logger.warning(f"⚠️  更新前端代理失败: {e}")

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
    
    if missing_packages:
        logger.error(f"缺少依赖包: {', '.join(missing_packages)}")
        logger.info("请运行: pip install -r requirements.txt")
        return False
    
    return True

def create_directories():
    """创建必要的目录"""
    directories = ['models', 'feedback']
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"确保目录存在: {directory}")

def start_server(port: int):
    """启动服务器"""
    try:
        logger.info(f"正在启动SpecialCare Connect API服务器...")
        logger.info(f"服务器地址: http://localhost:{port}")
        logger.info(f"API文档: http://localhost:{port}/docs")
        logger.info("按 Ctrl+C 停止服务器")
        
        # 启动服务器
        subprocess.run([
            sys.executable, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", str(port)
        ], check=True)
        
    except KeyboardInterrupt:
        logger.info("服务器已停止")
    except Exception as e:
        logger.error(f"启动服务器失败: {e}")
        return False
    
    return True

def main():
    """主函数"""
    logger.info("=== SpecialCare Connect 智能启动器 ===")
    
    # 检查依赖
    if not check_dependencies():
        return 1
    
    # 创建目录
    create_directories()
    
    # 查找可用端口
    logger.info("正在查找可用端口...")
    available_port = find_available_port(8000, 20)
    
    if not available_port:
        logger.error("❌ 未找到可用端口")
        logger.info("请关闭占用端口的程序或手动指定端口")
        return 1
    
    logger.info(f"✅ 找到可用端口: {available_port}")
    
    # 更新前端代理
    update_frontend_proxy(available_port)
    
    # 启动服务器
    if not start_server(available_port):
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 