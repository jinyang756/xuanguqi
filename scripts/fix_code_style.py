import os
import re

# 修复代码风格的函数
def fix_code_style(file_path):
    # 读取文件内容
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # 修复空白行包含空格的问题
    fixed_lines = []
    for line in lines:
        # 如果是空白行但包含空格，替换为纯空白行
        if line.strip() == '' and line != '\n':
            fixed_lines.append('\n')
        else:
            fixed_lines.append(line)
    
    # 确保文件末尾有换行符
    if fixed_lines and fixed_lines[-1].endswith('\n') is False:
        fixed_lines[-1] += '\n'
    
    # 重新组合成文件内容
    fixed_content = ''.join(fixed_lines)
    
    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print(f"已修复 {file_path} 的代码风格问题")

# 执行修复
if __name__ == '__main__':
    target_file = os.path.join(os.path.dirname(__file__), 'backend', 'parse_day_files.py')
    fix_code_style(target_file)