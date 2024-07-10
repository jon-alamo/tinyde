import os
import shutil

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
