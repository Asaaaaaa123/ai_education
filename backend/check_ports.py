#!/usr/bin/env python3
"""
端口检查脚本 - 检查常用端口是否被占用
"""

import socket
import sys
from typing import List

def check_port(host: str, port: int) -> bool:
    """检查端口是否可用"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            result = s.connect_ex((host, port))
            return result != 0  # 0表示端口被占用
    except Exception:
        return False

def find_available_port(start_port: int = 8000, max_attempts: int = 20) -> int:
    """查找可用端口"""
    for port in range(start_port, start_port + max_attempts):
        if check_port('localhost', port):
            return port
    return None

def main():
    print("=== 端口检查工具 ===")
    print()
    
    # 检查常用端口
    common_ports = [3000, 8000, 8001, 8002, 8080, 9000]
    
    print("检查常用端口状态:")
    for port in common_ports:
        status = "✅ 可用" if check_port('localhost', port) else "❌ 被占用"
        print(f"  端口 {port}: {status}")
    
    print()
    
    # 查找可用端口
    print("查找可用端口:")
    available_port = find_available_port(8000, 20)
    if available_port:
        print(f"✅ 找到可用端口: {available_port}")
        print()
        print("建议配置:")
        print(f"   后端端口: {available_port}")
        print(f"   前端代理: http://localhost:{available_port}")
    else:
        print("❌ 未找到可用端口")
    
    print()
    print("=== 解决方案 ===")
    print("1. 使用找到的可用端口")
    print("2. 关闭占用端口的程序")
    print("3. 修改配置文件中的端口号")
    
    # 提供修改建议
    if available_port:
        print()
        print("=== 快速修改 ===")
        print(f"要使用端口 {available_port}，请运行:")
        print(f"python -m uvicorn app:app --host 0.0.0.0 --port {available_port}")

if __name__ == "__main__":
    main() 