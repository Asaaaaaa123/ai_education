#!/usr/bin/env python3
"""
测试脚本 - 验证应用是否能正常启动
"""

import sys
import os
import asyncio
from fastapi.testclient import TestClient

# 添加当前目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import app
    print("✅ 应用导入成功")
    
    # 创建测试客户端
    client = TestClient(app)
    print("✅ 测试客户端创建成功")
    
    # 测试根路径
    response = client.get("/")
    print(f"✅ 根路径测试: {response.status_code}")
    print(f"   响应: {response.json()}")
    
    # 测试健康检查
    response = client.get("/health")
    print(f"✅ 健康检查测试: {response.status_code}")
    print(f"   响应: {response.json()}")
    
    print("\n🎉 所有测试通过！应用可以正常启动。")
    
except ImportError as e:
    print(f"❌ 导入错误: {e}")
    print("请检查依赖包是否已安装: pip install -r requirements.txt")
    
except Exception as e:
    print(f"❌ 测试失败: {e}")
    print("请检查应用代码是否有错误")

if __name__ == "__main__":
    print("=== SpecialCare Connect 应用测试 ===")
    print() 