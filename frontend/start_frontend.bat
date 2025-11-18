@echo off
echo 启动前端服务器...

:: 设置端口
set PORT=3000

:: 检查node_modules是否存在
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
)

:: 启动开发服务器
echo 启动React开发服务器...
npm start
