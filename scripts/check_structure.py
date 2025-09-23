import os
import sys

def check_project_structure():
    """检查项目目录结构是否符合规范"""
    print("开始检查项目目录结构...")
    
    # 设置项目根目录
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 定义需要检查的路径列表
    required_paths = [
        # 文档路径
        "docs/README.md",
        "docs/开发维护日志.md",
        "docs/A股数据清理和目录优化报告.md",
        
        # 后端路径
        "backend/filtering/select_stock.py",
        "backend/data_processing/parse_day_files.py",
        "backend/api/free_stock_data.py",
        "backend/tests/test_stock_selection.py",
        
        # 前端路径
        "src/index.html",
        "src/js/stock_selector.js",
        "src/js/tushare_api.js",
        
        # 数据路径
        "data/original/a_stock_lday",
        "data/processed",
        
        # 工具脚本路径
        "scripts/",
        "logs/",
        "config/vercel.json",
        
        # 根目录文件
        ".gitignore",
        "run_stock_selector.py",
        "更新股票数据.bat"
    ]
    
    # 定义目录结构规范（用于深度检查）
    directory_structure = {
        "backend": ["data_processing", "filtering", "api", "tests"],
        "src": ["js", "css", "resources"],
        "scripts": [],
        "docs": [],
        "logs": [],
        "config": []
    }
    
    # 检查必需的文件和目录是否存在
    missing_paths = []
    for path in required_paths:
        full_path = os.path.join(root_dir, path)
        if not os.path.exists(full_path):
            missing_paths.append(path)
    
    # 检查目录结构是否符合规范
    invalid_structure = []
    for parent, expected_children in directory_structure.items():
        parent_path = os.path.join(root_dir, parent)
        if os.path.exists(parent_path) and os.path.isdir(parent_path):
            # 获取实际子目录
            actual_children = [name for name in os.listdir(parent_path) if os.path.isdir(os.path.join(parent_path, name))]
            
            # 检查是否包含所有必需的子目录
            for child in expected_children:
                if child not in actual_children:
                    invalid_structure.append(f"{parent}目录缺少{child}子目录")
    
    # 检查前端引用路径是否正确
    html_file = os.path.join(root_dir, "src/index.html")
    if os.path.exists(html_file):
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'src="js/tushare_api.js"' not in content or 'src="js/stock_selector.js"' not in content:
                invalid_structure.append("index.html中的JS文件引用路径不正确")
    
    # 输出检查结果
    if missing_paths or invalid_structure:
        print("\n⚠️ 项目结构检查发现问题：")
        
        if missing_paths:
            print("\n缺失的文件或目录：")
            for path in missing_paths:
                print(f"  - {path}")
        
        if invalid_structure:
            print("\n不符合规范的结构：")
            for issue in invalid_structure:
                print(f"  - {issue}")
        
        print("\n请修复上述问题以保持项目结构规范。")
        return False
    else:
        print("\n✅ 项目结构检查通过！所有必需的文件和目录都存在，结构符合规范。")
        return True

if __name__ == "__main__":
    # 设置Windows编码
    if sys.platform == 'win32':
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    
    success = check_project_structure()
    sys.exit(0 if success else 1)