"""
检查API路由是否正确注册
"""
import sys
import os

# 添加backend目录到路径
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

try:
    from app import app
    
    print("=== FastAPI应用路由检查 ===")
    print(f"\n应用名称: {app.title}")
    
    # 检查所有路由
    routes = []
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            methods = ', '.join(sorted(route.methods))
            routes.append(f"{methods:20s} {route.path}")
        elif hasattr(route, 'path'):
            routes.append(f"{'N/A':20s} {route.path}")
    
    # 过滤并显示plans相关路由
    plans_routes = [r for r in routes if '/api/plans' in r]
    all_routes = [r for r in routes if not r.startswith('/docs') and not r.startswith('/openapi')]
    
    print(f"\n总共 {len(all_routes)} 个路由")
    print("\n所有路由:")
    for route in sorted(all_routes):
        print(f"  {route}")
    
    print("\n计划API路由:")
    if plans_routes:
        for route in sorted(plans_routes):
            print(f"  ✅ {route}")
    else:
        print("  ❌ 未找到计划API路由！")
    
    # 检查/api/plans/children
    children_route = [r for r in routes if '/api/plans/children' in r]
    if children_route:
        print("\n✅ /api/plans/children 路由存在:")
        for route in children_route:
            print(f"  {route}")
    else:
        print("\n❌ /api/plans/children 路由不存在！")
        
except Exception as e:
    print(f"❌ 检查失败: {e}")
    import traceback
    traceback.print_exc()



