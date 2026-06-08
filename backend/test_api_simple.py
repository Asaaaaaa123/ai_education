"""
简单测试API是否可访问
"""
import requests
import json

# 测试根路径
print("测试根路径...")
try:
    response = requests.get("http://localhost:8001/", timeout=5)
    print(f"根路径状态码: {response.status_code}")
    print(f"响应: {response.json()}")
except Exception as e:
    print(f"根路径测试失败: {e}")

# 测试健康检查
print("\n测试健康检查...")
try:
    response = requests.get("http://localhost:8001/health", timeout=5)
    print(f"健康检查状态码: {response.status_code}")
    print(f"响应: {response.json()}")
except Exception as e:
    print(f"健康检查测试失败: {e}")

# 测试API文档
print("\n测试API文档...")
try:
    response = requests.get("http://localhost:8001/docs", timeout=5)
    print(f"API文档状态码: {response.status_code}")
    if response.status_code == 200:
        print("API文档可以访问")
except Exception as e:
    print(f"API文档测试失败: {e}")

# 测试计划API
print("\n测试计划API...")
try:
    test_data = {
        "name": "测试",
        "age": 6,
        "gender": "male",
        "birth_date": "2018-01-01",
        "parent_name": "测试家长"
    }
    response = requests.post(
        "http://localhost:8001/api/plans/children",
        json=test_data,
        headers={"Content-Type": "application/json"},
        timeout=5
    )
    print(f"计划API状态码: {response.status_code}")
    print(f"响应: {response.text[:200]}")
    if response.status_code == 200:
        print("计划API工作正常！")
except Exception as e:
    print(f"计划API测试失败: {e}")



