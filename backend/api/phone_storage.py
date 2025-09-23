#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
手机号存储API
此脚本用于处理用户手机号的存储和验证功能
"""

import json
import os
from datetime import datetime

class PhoneStorage:
    def __init__(self):
        # 数据目录
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.data_dir = os.path.join(self.base_dir, 'data')
        self.phone_storage_file = os.path.join(self.data_dir, 'user_phones.json')
        
        # 创建数据目录（如果不存在）
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
            print(f"创建数据目录: {self.data_dir}")
        
        # 初始化存储文件（如果不存在）
        if not os.path.exists(self.phone_storage_file):
            with open(self.phone_storage_file, 'w', encoding='utf-8') as f:
                json.dump([], f, ensure_ascii=False, indent=2)
            print(f"创建手机号存储文件: {self.phone_storage_file}")
    
    def save_phone_number(self, phone_number):
        """
        保存手机号到存储文件
        @param {string} phone_number - 用户手机号
        @returns {dict} 操作结果
        """
        try:
            # 验证手机号格式
            if not self._validate_phone(phone_number):
                return {
                    'success': False,
                    'message': '请输入有效的手机号码'
                }
            
            # 读取现有数据
            with open(self.phone_storage_file, 'r', encoding='utf-8') as f:
                phones_data = json.load(f)
            
            # 检查手机号是否已存在
            for item in phones_data:
                if item['phone'] == phone_number:
                    # 更新现有记录的时间戳
                    item['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    with open(self.phone_storage_file, 'w', encoding='utf-8') as f:
                        json.dump(phones_data, f, ensure_ascii=False, indent=2)
                    return {
                        'success': True,
                        'message': '手机号验证成功',
                        'is_new': False
                    }
            
            # 添加新手机号记录
            new_record = {
                'phone': phone_number,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'ip_address': 'unknown',  # 在实际环境中可以获取用户IP
                'user_agent': 'unknown'   # 在实际环境中可以获取用户Agent
            }
            phones_data.append(new_record)
            
            # 保存更新后的数据
            with open(self.phone_storage_file, 'w', encoding='utf-8') as f:
                json.dump(phones_data, f, ensure_ascii=False, indent=2)
            
            print(f"成功保存手机号: {phone_number}")
            return {
                'success': True,
                'message': '手机号验证成功',
                'is_new': True
            }
        except Exception as e:
            print(f"保存手机号失败: {str(e)}")
            return {
                'success': False,
                'message': f'保存失败: {str(e)}'
            }
    
    def _validate_phone(self, phone_number):
        """
        验证手机号格式是否正确
        @param {string} phone_number - 用户手机号
        @returns {boolean} 手机号是否有效
        """
        # 简单的手机号格式验证（中国大陆手机号）
        import re
        pattern = r'^1[3-9]\d{9}$'
        return bool(re.match(pattern, phone_number))
    
    def get_phone_count(self):
        """
        获取已存储的手机号数量
        @returns {int} 手机号数量
        """
        try:
            with open(self.phone_storage_file, 'r', encoding='utf-8') as f:
                phones_data = json.load(f)
            return len(phones_data)
        except Exception as e:
            print(f"获取手机号数量失败: {str(e)}")
            return 0

# 主函数，用于测试功能
if __name__ == "__main__":
    print("===== 手机号存储API测试 =====")
    
    # 创建实例
    phone_storage = PhoneStorage()
    
    # 测试保存手机号
    test_phones = ['13812345678', '13987654321', '12345678901']  # 最后一个是无效手机号
    
    for phone in test_phones:
        result = phone_storage.save_phone_number(phone)
        print(f"保存手机号 {phone}: {result}")
    
    # 测试重复保存
    result = phone_storage.save_phone_number('13812345678')
    print(f"重复保存手机号: {result}")
    
    # 获取手机号数量
    count = phone_storage.get_phone_count()
    print(f"已存储的手机号数量: {count}")
    
    print("===== 测试完成 =====")