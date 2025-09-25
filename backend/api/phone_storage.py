#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
用户数据存储API
此脚本用于处理用户信息（姓名和手机号）的存储和验证功能
"""

import json
import os
from datetime import datetime

class UserDataStorage:
    def __init__(self):
        # 数据目录
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.data_dir = os.path.join(self.base_dir, 'data')
        self.user_storage_file = os.path.join(self.data_dir, 'user_data.json')
        
        # 创建数据目录（如果不存在）
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
            print(f"创建数据目录: {self.data_dir}")
        
        # 初始化存储文件（如果不存在）
        if not os.path.exists(self.user_storage_file):
            with open(self.user_storage_file, 'w', encoding='utf-8') as f:
                json.dump([], f, ensure_ascii=False, indent=2)
            print(f"创建用户数据存储文件: {self.user_storage_file}")
    
    def save_user_data(self, name, phone_number, ip_address='unknown', user_agent='unknown'):
        """
        保存用户数据到存储文件
        @param {string} name - 用户姓名
        @param {string} phone_number - 用户手机号
        @param {string} ip_address - 用户IP地址
        @param {string} user_agent - 用户浏览器标识
        @returns {dict} 操作结果
        """
        try:
            # 验证姓名
            if not self._validate_name(name):
                return {
                    'success': False,
                    'message': '请输入有效的姓名'
                }
            
            # 验证手机号格式
            if not self._validate_phone(phone_number):
                return {
                    'success': False,
                    'message': '请输入有效的手机号码'
                }
            
            # 读取现有数据
            with open(self.user_storage_file, 'r', encoding='utf-8') as f:
                user_data = json.load(f)
            
            # 检查手机号是否已存在
            for item in user_data:
                if item['phone'] == phone_number:
                    # 更新现有记录
                    item['name'] = name
                    item['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    item['ip_address'] = ip_address
                    item['user_agent'] = user_agent
                    
                    with open(self.user_storage_file, 'w', encoding='utf-8') as f:
                        json.dump(user_data, f, ensure_ascii=False, indent=2)
                    
                    return {
                        'success': True,
                        'message': '用户数据更新成功',
                        'is_new': False
                    }
            
            # 添加新用户记录
            new_record = {
                'name': name,
                'phone': phone_number,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'ip_address': ip_address,
                'user_agent': user_agent
            }
            user_data.append(new_record)
            
            # 保存更新后的数据
            with open(self.user_storage_file, 'w', encoding='utf-8') as f:
                json.dump(user_data, f, ensure_ascii=False, indent=2)
            
            print(f"成功保存用户数据: {name}, {phone_number}")
            return {
                'success': True,
                'message': '用户数据保存成功',
                'is_new': True
            }
        except Exception as e:
            print(f"保存用户数据失败: {str(e)}")
            return {
                'success': False,
                'message': f'保存失败: {str(e)}'
            }
            
    def _validate_name(self, name):
        """
        验证用户姓名是否有效
        @param {string} name - 用户姓名
        @returns {boolean} 姓名是否有效
        """
        # 简单的姓名验证：长度在2-20个字符之间，不包含特殊字符
        if not name or len(name.strip()) < 2 or len(name.strip()) > 20:
            return False
        # 允许中文、英文和一些常见符号
        import re
        pattern = r'^[\u4e00-\u9fa5a-zA-Z·\.\-\s]+$'
        return bool(re.match(pattern, name))
    
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

    def get_user_count(self):
        """
        获取已存储的用户数据数量
        @returns {int} 用户数量
        """
        try:
            with open(self.user_storage_file, 'r', encoding='utf-8') as f:
                user_data = json.load(f)
            return len(user_data)
        except Exception as e:
            print(f"获取用户数量失败: {str(e)}")
            return 0

# 为了向后兼容，保留原有的类名和方法
class PhoneStorage(UserDataStorage):
    def __init__(self):
        super().__init__()
        # 兼容旧的存储文件路径
        self.phone_storage_file = self.user_storage_file
    
    def save_phone(self, phone):
        """为了兼容旧API的方法"""
        result = self.save_user_data('未知用户', phone)
        return result['success']
        
    def save_phone_number(self, phone_number):
        """保持原有的方法名以兼容旧代码"""
        result = self.save_user_data('未知用户', phone_number)
        return result
        
    def validate_phone(self, phone):
        """验证手机号格式"""
        return self._validate_phone(phone)
        
    def is_phone_exist(self, phone):
        """检查手机号是否存在"""
        try:
            with open(self.user_storage_file, 'r', encoding='utf-8') as f:
                user_data = json.load(f)
            for item in user_data:
                if item['phone'] == phone:
                    return True
            return False
        except:
            return False
            
    def get_phone_count(self):
        """获取手机号数量"""
        return self.get_user_count()

# 主函数，用于测试功能
if __name__ == "__main__":
    print("===== 用户数据存储API测试 =====")
    
    # 创建实例
    user_storage = UserDataStorage()
    
    # 测试保存用户数据
    test_users = [
        ('张三', '13812345678'),
        ('李四', '13987654321'),
        ('王五', '12345678901')  # 无效手机号
    ]
    
    for name, phone in test_users:
        result = user_storage.save_user_data(name, phone)
        print(f"保存用户数据 {name}, {phone}: {result}")
    
    # 测试重复保存
    result = user_storage.save_user_data('张三更新', '13812345678')
    print(f"更新用户数据: {result}")
    
    # 获取用户数量
    count = user_storage.get_user_count()
    print(f"已存储的用户数量: {count}")
    
    print("===== 测试完成 =====")