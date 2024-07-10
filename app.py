from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import os
from file_operations import create_file, create_directory, delete_item, rename_item, move_item, save_file_content, get_file_content

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/files', methods=['GET'])
def list_files():
    root_dir = request.args.get('path', '.')
    file_structure = get_file_structure(root_dir)
    return jsonify(file_structure)

@app.route('/file', methods=['POST'])
def create():
    data = request.json
    if data['type'] == 'file':
        create_file(data['path'], data['name'])
    elif data['type'] == 'directory':
        create_directory(data['path'], data['name'])
    return jsonify({"success": True})

@app.route('/file', methods=['DELETE'])
def delete():
    data = request.json
    delete_item(data['path'])
    return jsonify({"success": True})

@app.route('/file', methods=['PUT'])
def rename():
    data = request.json
    rename_item(data['old_path'], data['new_path'])
    return jsonify({"success": True})

@app.route('/file/move', methods=['PUT'])
def move():
    data = request.json
    app_root = os.path.abspath('chatgpt4o_solution')
    old_path = os.path.join(app_root, data['old_path'])
    new_path = os.path.join(app_root, data['new_path'])
    move_item(old_path, new_path)
    return jsonify({"success": True})

@app.route('/file/content', methods=['GET'])
def get_content():
    file_path = request.args.get('path')
    content = get_file_content(file_path)
    return jsonify({"content": content})

@app.route('/file/content', methods=['POST'])
def save_content():
    data = request.json
    save_file_content(data['path'], data['content'])
    return jsonify({"success": True})

def get_file_structure(root_dir):
    file_structure = []
    for root, dirs, files in os.walk(root_dir):
        for directory in dirs:
            file_structure.append({"type": "directory", "path": os.path.relpath(os.path.join(root, directory), root_dir)})
        for file in files:
            file_structure.append({"type": "file", "path": os.path.relpath(os.path.join(root, file), root_dir)})
    return file_structure

if __name__ == '__main__':
    app.run(debug=True)
