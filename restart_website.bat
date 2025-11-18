@echo off
echo ========================================
echo    重启 SpecialCare Connect 网站
echo ========================================

echo.
echo 正在停止现有服务...

:: 尝试停止后端服务（通过进程名）
taskkill /F /FI "WINDOWTITLE eq Backend Server*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Frontend Server*" >nul 2>&1

:: 通过端口查找并停止进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8001" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo 等待服务停止...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    启动服务
echo ========================================

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

:: 启动后端
echo.
echo 正在启动后端服务器...
start "Backend Server" cmd /k "cd /d %~dp0backend && python start.py"

:: 等待后端启动
echo 等待后端启动...
timeout /t 5 /nobreak >nul

:: 启动前端
echo.
echo 正在启动前端服务器...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo 网站重启完成！
echo 前端地址: http://localhost:3000
echo 后端API: http://localhost:8001
echo API文档: http://localhost:8001/docs
echo ========================================
echo.
echo 新功能入口:
echo   - 孩子信息录入: http://localhost:3000/child-registration
echo   - 游戏测试: http://localhost:3000/child-test
echo   - 训练计划: http://localhost:3000/training-plan
echo ========================================
echo.
echo 按任意键关闭此窗口...
pause >nul












