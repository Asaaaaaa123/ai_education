@echo off
echo 启动后端服务器...

:: 激活虚拟环境（如果存在）
if exist "venv\Scripts\activate.bat" (
    echo 激活虚拟环境...
    call venv\Scripts\activate.bat
)

:: 检查依赖
echo 检查依赖...
python -c "import fastapi, uvicorn, torch, numpy, pydantic" 2>nul
if %errorlevel% neq 0 (
    echo 正在安装依赖...
    pip install -r requirements.txt
)

:: 创建必要目录
if not exist "models" mkdir models
if not exist "feedback" mkdir feedback

:: 启动服务器
echo 启动FastAPI服务器...
python start.py
