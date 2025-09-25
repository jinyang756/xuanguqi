# -*- coding: utf-8 -*-

"""用户数据存储API模块
提供接收和存储用户姓名和手机号的功能
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

# 确保可以导入UserDataStorage类
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from api.phone_storage import UserDataStorage

class SaveUserDataAPIHandler(BaseHTTPRequestHandler):
    """处理保存用户数据的HTTP请求"""
    
    def do_POST(self):
        """处理POST请求，接收并验证用户数据"""
        # 只允许特定的API路径
        if self.path != '/api/save_user_data':
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
            name = data.get('name')
            phone = data.get('phone')
            
            # 验证数据是否存在
            if not name or not phone:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'message': '姓名和手机号不能为空'}).encode('utf-8'))
                return
                
            # 初始化UserDataStorage实例
            storage = UserDataStorage()
            
            # 获取用户IP和User-Agent（如果需要）
            ip_address = self.client_address[0] if hasattr(self, 'client_address') else 'unknown'
            user_agent = self.headers.get('User-Agent', 'unknown')
            
            # 保存用户数据
            result = storage.save_user_data(name, phone, ip_address, user_agent)
            
            if result['success']:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': True,
                    'message': result['message'],
                    'data': {'name': name, 'phone': phone}
                }).encode('utf-8'))
            else:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'message': result['message']
                }).encode('utf-8'))
                
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
    httpd = HTTPServer(server_address, SaveUserDataAPIHandler)
    print('Starting save_user_data API server on port 8000...')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print('Server stopped.')