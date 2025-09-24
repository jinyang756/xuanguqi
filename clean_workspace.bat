@echo off
REM 一键清理选股器项目无关部署文件，仅保留前端 src/ 和 api/ 目录

REM 1. 删除 Python 缓存
rd /s /q backend\__pycache__
rd /s /q backend\filtering\__pycache__

REM 2. 删除后端数据、日志、测试、脚本等目录
rd /s /q backend\data
rd /s /q backend\data_processing
rd /s /q backend\tests
rd /s /q backend\logs
rd /s /q scripts
rd /s /q logs
rd /s /q data

REM 3. 删除本地工具和启动脚本
del run_tool_scripts.bat
del run_stock_selector.py
del config.json
del 更新股票数据.bat

REM 4. 删除根目录下无关文件（可选）
del .gitignore
del cleanup_execution_log.txt

REM 5. 保留 src/ 前端目录和 api/ Serverless Function
echo 清理完成，仅保留 src/ 和 api/ 目录用于前端和 Serverless 部署！
pause