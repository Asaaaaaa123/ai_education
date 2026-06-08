@echo off
echo ========================================
echo    SpecialCare Connect 网站启动器
echo ========================================

echo 正在检查环境...

:: 检查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

:: 检查Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Python，请先安装Python
    pause
    exit /b 1
)

echo 环境检查完成！

:: 启动后端
echo.
echo 正在启动后端服务器...
start "Backend Server" cmd /k "cd backend && python start.py"

:: 等待后端启动
echo 等待后端启动...
timeout /t 5 /nobreak >nul

:: 启动前端
echo.
echo 正在启动前端服务器...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo 网站启动完成！
echo 前端地址: http://localhost:3000
echo 后端API: http://localhost:8001
echo API文档: http://localhost:8001/docs
echo ========================================
echo.
echo 按任意键关闭此窗口...
pause >nul
