from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import os
import file_operations as fo
import jedi

app = Flask(__name__)
CORS(app)

root_path = 'hapy'


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/files', methods=['GET'])
def list_files():
    base_dir = request.args.get('path', '.')
    file_structure = fo.get_file_structure(base_dir)
    return jsonify(file_structure)


@app.route('/file', methods=['POST'])
def create():
    data = request.json
    if data['type'] == 'file':
        fo.create_file(data['path'], data['name'])
    elif data['type'] == 'directory':
        fo.create_directory(data['path'], data['name'])
    return jsonify({"success": True})


@app.route('/file', methods=['DELETE'])
def delete():
    data = request.json
    fo.delete_item(data['path'])
    return jsonify({"success": True})

@app.route('/file', methods=['PUT'])
def rename():
    data = request.json
    fo.rename_item(data['old_path'], data['new_path'])
    return jsonify({"success": True})


@app.route('/file/move', methods=['PUT'])
def move():
    data = request.json
    fo.move_item(data['old_path'], data['new_path'])
    return jsonify({"success": True})

@app.route('/file/content', methods=['GET'])
def get_content():
    file_path = request.args.get('path')
    content = fo.get_file_content(file_path)
    return jsonify({"content": content})


@app.route('/file/content', methods=['POST'])
def save_content():
    data = request.json
    fo.save_file_content(data['path'], data['content'])
    return jsonify({"success": True})


@app.route('/object-attributes', methods=['GET'])
def get_object_attributes():
    obj_name = request.args.get('object')
    # This is a simplified example. In reality, you'd need a more sophisticated
    # way to get object attributes, possibly using the `inspect` module or
    # AST parsing.
    attributes = []
    try:
        obj = eval(obj_name)
        attributes = dir(obj)
    except:
        pass
    return jsonify(attributes)


@app.route('/autocomplete', methods=['POST'])
def autocomplete():
    data = request.json
    source = data['source']
    line = data['line']
    column = data['column']
    file_path = data['file']
    completions = fo.autocomplete(
        source=source, line=line, column=column, file_path=file_path
    )
    return jsonify(completions)


if __name__ == '__main__':
    app.run(debug=True, port=5001)
