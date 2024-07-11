import os
import shutil


ROOT_PATH = 'hapy'


def create_file(path, name):
    full_path = os.path.join(path, name)
    full_path = os.path.join(ROOT_PATH, full_path)
    open(full_path, 'w').close()


def create_directory(path, name):
    full_path = os.path.join(path, name)
    full_path = os.path.join(ROOT_PATH, full_path)
    os.makedirs(full_path)


def delete_item(path):
    path = os.path.join(ROOT_PATH, path)
    if os.path.isdir(path):
        os.rmdir(path)
    else:
        os.remove(path)


def rename_item(old_path, new_path):
    old_path = os.path.join(ROOT_PATH, old_path)
    new_path = os.path.join(ROOT_PATH, new_path)
    os.rename(old_path, new_path)


def move_item(old_path, new_path):
    old_path = os.path.join(ROOT_PATH, old_path)
    new_path = os.path.join(ROOT_PATH, new_path)
    shutil.move(old_path, new_path)


def save_file_content(path, content):
    path = os.path.join(ROOT_PATH, path)
    with open(path, 'w') as f:
        f.write(content)


def get_file_content(path):
    path = os.path.join(ROOT_PATH, path)
    with open(path, 'r') as f:
        return f.read()


def get_file_structure(base_dir):
    root_dir = os.path.join(ROOT_PATH, base_dir)
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
    return file_structure
