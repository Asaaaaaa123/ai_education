"""
测试API路由是否正确注册
"""
import requests
import json

# 测试创建孩子信息API
test_data = {
    "name": "测试孩子",
    "age": 6,
    "gender": "male",
    "birth_date": "2018-01-01",
    "parent_name": "测试家长"
}

try:
    print("测试API: POST http://localhost:8001/api/plans/children")
    response = requests.post(
        "http://localhost:8001/api/plans/children",
        json=test_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.text}")
    
    if response.status_code == 200:
        print("✅ API路由正常工作")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    else:
        print(f"❌ API返回错误: {response.status_code}")
        print(response.text)
        
except requests.exceptions.ConnectionError:
    print("❌ 无法连接到服务器，请确保后端服务正在运行")
except Exception as e:
    print(f"❌ 测试失败: {e}")



