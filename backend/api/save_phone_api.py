#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""手机号存储API模块
提供接收和存储用户手机号的功能
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs
from datetime import datetime

# 确保可以导入PhoneStorage类
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from api.phone_storage import PhoneStorage

class SavePhoneAPIHandler(BaseHTTPRequestHandler):
    """处理保存手机号的HTTP请求"""
    
    def do_POST(self):
        """处理POST请求，接收并验证手机号"""
        # 只允许特定的API路径
        if self.path != '/api/save_phone':
            self.send_response(404)
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'message': '路径不存在'}).encode('utf-8'))
            return
            
        # 获取请求体数据
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        
        try:
            # 解析JSON数据
            data = json.loads(post_data)
            phone = data.get('phone')
            
            # 验证手机号是否存在
            if not phone:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'message': '手机号不能为空'}).encode('utf-8'))
                return
                
            # 初始化PhoneStorage实例
            storage = PhoneStorage()
            
            # 验证手机号格式
            if not storage.validate_phone(phone):
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'message': '手机号格式不正确'}).encode('utf-8'))
                return
                
            # 检查手机号是否已存在（可选）
            if storage.is_phone_exist(phone):
                # 如果允许重复存储，可以跳过此检查
                # 这里我们选择允许重复，但返回提示信息
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': True,
                    'message': '手机号已存在',
                    'data': {'phone': phone}
                }).encode('utf-8'))
                return
                
            # 保存手机号
            result = storage.save_phone(phone)
            
            if result:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': True,
                    'message': '手机号保存成功',
                    'data': {'phone': phone}
                }).encode('utf-8'))
            else:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'message': '保存手机号失败'}).encode('utf-8'))
                
        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'message': '请求数据格式错误'}).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'message': f'服务器错误: {str(e)}'}).encode('utf-8'))
            
    def do_OPTIONS(self):
        """处理跨域预检请求"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def end_headers(self):
        """在响应头中添加跨域支持"""
        self.send_header('Access-Control-Allow-Origin', '*')
        BaseHTTPRequestHandler.end_headers(self)


if __name__ == '__main__':
    import sys
    # 确保模块路径正确
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    
    # 启动服务器
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, SavePhoneAPIHandler)
    print('Starting save_phone API server on port 8000...')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print('Server stopped.')