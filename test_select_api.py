import json
import sys
import json
from api.select import handler

# 创建一个模拟的请求对象
def test_handler():
    try:
        # 测试OPTIONS请求
        options_request = {"method": "OPTIONS"}
        options_response = handler(options_request)
        print("OPTIONS请求测试结果:")
        print(json.dumps(options_response, indent=2, ensure_ascii=False))
        print("\n")
        
        # 测试GET请求 - 突破策略
        get_request = {"method": "GET"}
        get_response = handler(get_request)
        print("突破策略GET请求测试结果:")
        print(json.dumps(get_response, indent=2, ensure_ascii=False))
        print("\n")
        
        # 测试POST请求 - 短期增长策略
        post_request = {
            "method": "POST",
            "body": json.dumps({"strategy": "short_term_growth"})
        }
        post_response = handler(post_request)
        print("短期增长策略POST请求测试结果:")
        print(json.dumps(post_response, indent=2, ensure_ascii=False))
        
    except Exception as e:
        print(f"测试过程中发生错误: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    print("开始测试api/select.py中的handler函数...")
    success = test_handler()
    if success:
        print("\n测试成功!")
    else:
        print("\n测试失败!")
        sys.exit(1)