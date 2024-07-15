import os
import shutil
import jedi

ROOT_PATH = os.path.dirname(os.path.abspath(__file__))  # Adjusted root path


def create_file(path, name):
    full_path = os.path.join(path, name)
    open(full_path, 'w').close()


def create_directory(path, name):
    full_path = os.path.join(path, name)
    os.makedirs(full_path)


def delete_item(path):
    if os.path.isdir(path):
        os.rmdir(path)
    else:
        os.remove(path)


def rename_item(old_path, new_path):
    os.rename(old_path, new_path)


def move_item(old_path, new_path):
    shutil.move(old_path, new_path)


def save_file_content(path, content):
    with open(path, 'w') as f:
        f.write(content)


def get_file_content(path):
    with open(path, 'r') as f:
        return f.read()


def get_file_structure(root_dir):
    file_structure = []
    for root, dirs, files in os.walk(root_dir):
        for directory in dirs:
            file_structure.append({
                "type": "directory",
                "path": os.path.relpath(os.path.join(root, directory), root_dir)
            })
        for file in files:
            file_structure.append({
                "type": "file",
                "path": os.path.relpath(os.path.join(root, file), root_dir)
            })
        break
    return file_structure


def autocomplete(source, line, column, file_path=None):
    kwargs = {'path': file_path} if file_path else {}
    script = jedi.Script(source, **kwargs)
    completions = script.complete(line, column)
    return [{
        'name': c.name,
        'type': c.type,
        'description': c.description,
    } for c in completions]
