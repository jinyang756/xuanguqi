import sys
import os
import json

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    # 尝试导入SimpleStockSelector类
    from api.select import SimpleStockSelector, handler
    print("成功导入SimpleStockSelector和handler")
    
    # 创建模拟请求对象（对于Vercel Serverless Function）
    class MockRequest:
        pass
    
    # 测试handler函数
    print("开始测试handler函数...")
    result = handler(MockRequest())
    
    # 解析结果
    status_code = result["statusCode"]
    body = json.loads(result["body"])
    
    print(f"测试结果状态码: {status_code}")
    print(f"返回结果类型: {type(body)}")
    print(f"返回结果数量: {len(body)}")
    
    if len(body) > 0:
        print(f"返回的优选个股信息: {json.dumps(body[0], ensure_ascii=False, indent=2)}")
    else:
        print("没有符合条件的个股")
    
    # 验证是否只返回了最多一只个股
    assert len(body) <= 1, "返回的个股数量超过了1只"
    print("验证通过: 成功返回了最多一只个股")
    
except ImportError as e:
    print(f"导入错误: {str(e)}")
    print("请确保api/select.py文件存在且路径正确")
except Exception as e:
    print(f"测试过程中发生错误: {str(e)}")