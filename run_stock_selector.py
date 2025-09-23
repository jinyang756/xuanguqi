import sys
import os
import subprocess
import webbrowser
import time
import sys
from threading import Thread

# 设置Windows编码
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# 添加backend目录到Python路径
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# 启动HTTP服务器的函数
def start_http_server():
    try:
        print("\n正在启动前端HTTP服务器...")
        server_port = 8080
        server_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 在Windows上创建新的控制台窗口运行HTTP服务器
        if sys.platform == 'win32':
            cmd = f'start cmd /k "cd /d {server_dir} && python -m http.server {server_port}"'
            subprocess.run(cmd, shell=True)
        else:
            # 非Windows系统使用默认行为
            cmd = ['python', '-m', 'http.server', str(server_port)]
            subprocess.Popen(cmd, cwd=server_dir)
        
        print(f"HTTP服务器已在端口 {server_port} 启动")
        time.sleep(2)  # 等待服务器启动
        
        # 尝试自动打开浏览器
        try:
            webbrowser.open(f'http://localhost:{server_port}/src/')
            print("已尝试自动打开浏览器访问前端界面")
            print("如未自动打开，请手动访问: http://localhost:8080/src/")
        except Exception as e:
            print(f"无法自动打开浏览器: {e}")
            print("请手动访问: http://localhost:8080/src/")
    except Exception as e:
        print(f"启动HTTP服务器时出错: {e}")

# 运行后端选股逻辑
def run_stock_selection():
    from backend.filtering.select_stock import main as run_stock_selector
    try:
        print("=== 选股器启动 ===" 
              "\n正在读取股票数据并执行选股逻辑...\n")
        # 运行选股功能
        run_stock_selector()
        
        print("\n=== 选股器运行完成 ===")
        print("\n提示：")
        print("1. 选股结果基于短期上涨潜力分析")
        print("2. 如果需要查看更多股票数据或自定义选股条件，请修改backend/select_stock.py文件")
        print("3. 数据来源于data/processed目录下的JSON文件")
    except Exception as e:
        print(f"\n选股过程中发生错误: {str(e)}")
        print("请检查数据文件是否存在或格式是否正确")
        sys.exit(1)

# 主函数
def main():
    print("====== 选股器启动程序 ======")
    
    # 先运行后端选股逻辑
    run_stock_selection()
    
    # 然后启动前端HTTP服务器
    start_http_server()
    
    # 提示用户
    print("\n=== 启动完成 ===")
    print("后端选股逻辑已执行完毕")
    print("前端服务器已在新窗口启动")
    print("\n如需退出，请关闭所有相关窗口")

if __name__ == '__main__':
    main()