
from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
from tinyde import file_operations as fo
import os


def create_app(title="tinyde"):
    app = Flask(__name__)
    CORS(app)
    root_path = '.'


    @app.route('/')
    def index():
        return render_template('index.html', title=title)


    @app.route('/files', methods=['GET'])
    def list_files():
        base_dir = request.args.get('path', '')
        base_dir = base_dir if base_dir else ''
        directory = os.path.join(root_path, base_dir)
        file_structure = fo.get_file_structure(directory)
        return jsonify(file_structure)


    @app.route('/file', methods=['POST'])
    def create():
        data = request.json
        if data['type'] == 'file':
            fo.create_file(os.path.join(root_path, data['path']), data['name'])
        elif data['type'] == 'directory':
            fo.create_directory(os.path.join(root_path, data['path']), data['name'])
        return jsonify({"success": True})


    @app.route('/file', methods=['DELETE'])
    def delete():
        data = request.json
        fo.delete_item(os.path.join(root_path, data['path']))
        return jsonify({"success": True})


    @app.route('/file', methods=['PUT'])
    def rename():
        data = request.json
        fo.rename_item(os.path.join(root_path, data['old_path']), os.path.join(root_path, data['new_path']))
        return jsonify({"success": True})


    @app.route('/file/move', methods=['PUT'])
    def move():
        data = request.json
        fo.move_item(os.path.join(root_path, data['old_path']), os.path.join(root_path, data['new_path']))
        return jsonify({"success": True})


    @app.route('/file/content', methods=['GET'])
    def get_content():
        file_path = request.args.get('path')
        content = fo.get_file_content(os.path.join(root_path, file_path))
        return jsonify({"content": content})


    @app.route('/file/content', methods=['POST'])
    def save_content():
        data = request.json
        if data['path'] and data['content']:
            fo.save_file_content(os.path.join(root_path, data['path']), data['content'])
        return jsonify({"success": True})


    @app.route('/object-attributes', methods=['GET'])
    def get_object_attributes():
        obj_name = request.args.get('object')
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
            source=source, line=line, column=column, file_path=os.path.join(root_path, file_path)
        )
        return jsonify(completions)

    return app

def run_app(port, title):
    app = create_app(title)
    app.run(debug=True, port=port)

