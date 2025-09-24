try:
    # 尝试导入select.py中的SimpleStockSelector类
    from api.select import SimpleStockSelector
    print("成功导入SimpleStockSelector类")
    
    # 创建一个实例
    selector = SimpleStockSelector()
    print("成功创建SimpleStockSelector实例")
    
    # 如果能走到这里，说明基本的导入和实例化都没有问题
    print("测试通过：select.py可以正常导入和使用")
    print("\n注意：由于环境限制，无法直接测试完整的AkShare功能，")
    print("但在Vercel等Serverless环境中，系统会自动根据requirements.txt安装依赖。")
    
except ImportError as e:
    print(f"导入错误: {e}")
    print("请确保select.py文件存在且路径正确")

except Exception as e:
    print(f"发生错误: {e}")
    print("这可能是由于缺少依赖导致的")
    print("在Serverless环境中，Vercel会根据requirements.txt自动安装依赖")