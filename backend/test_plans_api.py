"""
测试plans API是否正常工作
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from api.plans import router
    print("✅ API路由导入成功")
    print(f"路由前缀: {router.prefix}")
    print(f"路由数量: {len(router.routes)}")
    for route in router.routes:
        if hasattr(route, 'path'):
            print(f"  - {route.methods if hasattr(route, 'methods') else 'N/A'}: {route.path}")
except Exception as e:
    print(f"❌ API路由导入失败: {e}")
    import traceback
    traceback.print_exc()



