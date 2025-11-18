@echo off
chcp 65001 >nul
echo 🎓 AI教育评估系统 - Windows启动脚本
echo ========================================

:: 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安装或未添加到PATH
    pause
    exit /b 1
)

:: 进入项目目录
cd /d "%~dp0"

:: 检查依赖
echo 🔍 检查依赖...
python -c "import torch, fastapi, uvicorn" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  依赖未安装，正在安装...
    python install_dependencies.py
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)

:: 启动后端服务
echo 🚀 启动后端API服务...
start "AI后端服务" cmd /k "cd /d %~dp0backend && python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload"

:: 等待后端启动
timeout /t 3 /nobreak >nul

:: 启动前端服务
echo 🌐 启动前端服务...
start "AI前端服务" cmd /k "cd /d %~dp0 && python -m http.server 8080"

:: 等待前端启动
timeout /t 2 /nobreak >nul

:: 打开浏览器
echo 🌍 打开浏览器...
start http://localhost:8080
start http://localhost:8000/docs

echo.
echo ✅ AI系统启动完成！
echo 📋 访问地址：
echo    • 前端界面: http://localhost:8080
echo    • API文档: http://localhost:8000/docs
echo.
echo 💡 提示：
echo    • 关闭命令行窗口即可停止服务
echo    • 按Ctrl+C可以停止单个服务
echo.
pause 