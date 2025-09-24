from flask import Flask, jsonify, request
import sys
import os
import json

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'filtering'))
from select_stock import main as run_stock_selector

app = Flask(__name__)

@app.route('/api/select', methods=['GET'])
def select_stocks():
    # 可根据实际需求传递参数
    config_path = os.path.join(os.path.dirname(__file__), '..', '..', 'config.json')
    config = {}
    if os.path.exists(config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
    result = run_stock_selector(config)
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=8081)