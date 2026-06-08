@echo off
chcp 65001 >nul
echo ========================================
echo SpecialCare Connect - 后端启动器
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Python，请先安装Python 3.8+
    pause
    exit /b 1
)

REM 检查虚拟环境
if exist "venv\Scripts\activate.bat" (
    echo 激活虚拟环境...
    call venv\Scripts\activate.bat
) else (
    echo 警告: 未找到虚拟环境，使用系统Python
)

REM 检查依赖
echo 检查依赖包...
python -c "import fastapi, uvicorn, torch, numpy, pydantic" >nul 2>&1
if errorlevel 1 (
    echo 安装依赖包...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo 错误: 依赖包安装失败
        pause
        exit /b 1
    )
)

REM 创建必要目录
echo 创建必要目录...
if not exist "models" mkdir models
if not exist "feedback" mkdir feedback

REM 启动服务器
echo.
echo 正在启动SpecialCare Connect API服务器...
echo 服务器地址: http://localhost:8001
echo API文档: http://localhost:8001/docs
echo 按 Ctrl+C 停止服务器
echo.
python -m uvicorn app:app --host 0.0.0.0 --port 8001

pause 