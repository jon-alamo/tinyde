document.addEventListener('DOMContentLoaded', () => {
    const fileBrowser = document.getElementById('file-browser');
    const editorElement = document.getElementById('editor');
    const createFileButton = document.getElementById('create-file');
    const createDirButton = document.getElementById('create-dir');
    const renameButton = document.getElementById('rename');
    const deleteButton = document.getElementById('delete');
    const saveButton = document.getElementById('save');
    const backButton = document.createElement('button');
    backButton.textContent = "Back";
    backButton.addEventListener('click', goBack);
    fileBrowser.parentNode.insertBefore(backButton, fileBrowser);
    const parentDropArea = document.createElement('div');
    parentDropArea.textContent = "Move to Parent Directory";
    parentDropArea.classList.add('parent-drop-area');
    parentDropArea.addEventListener('dragover', dragOver);
    parentDropArea.addEventListener('drop', dropToParent);
    fileBrowser.appendChild(parentDropArea);
    let currentDirectory = '.';
    let selectedFile = null;
    let editor = CodeMirror(editorElement, {
        lineNumbers: true,
        mode: 'python'
    });

    function fetchFiles() {
        fetch(`/files?path=${currentDirectory}`)
            .then(response => response.json())
            .then(data => {
                displayFiles(data);
            });
    }

    function displayFiles(files) {
        fileBrowser.innerHTML = '';
        fileBrowser.appendChild(parentDropArea); // Re-add the parent drop area
        files.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.textContent = file.path;
            fileElement.classList.add(file.type);
            fileElement.draggable = true;
            fileElement.addEventListener('click', () => {
                selectFile(fileElement, file.path);
            });
            fileElement.addEventListener('dblclick', () => {
                if (file.type === 'file') {
                    openFile(file.path);
                } else if (file.type === 'directory') {
                    changeDirectory(file.path);
                }
            });
            fileElement.addEventListener('dragstart', dragStart);
            fileElement.addEventListener('dragover', dragOver);
            fileElement.addEventListener('drop', drop);
            fileBrowser.appendChild(fileElement);
        });
    }

    function selectFile(element, path) {
        if (selectedFile) {
            selectedFile.classList.remove('selected');
        }
        selectedFile = element;
        selectedFile.classList.add('selected');
    }

    function openFile(filePath) {
        fetch(`/file/content?path=${filePath}`)
            .then(response => response.json())
            .then(data => {
                editor.setValue(data.content);
            });
    }

    function changeDirectory(directoryPath) {
        currentDirectory = directoryPath;
        fetchFiles();
    }

    function goBack() {
        if (currentDirectory !== '.') {
            const parentDir = currentDirectory.split('/').slice(0, -1).join('/');
            currentDirectory = parentDir === '' ? '.' : parentDir;
            fetchFiles();
        }
    }

    function dragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.textContent);
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const draggedFile = event.dataTransfer.getData('text/plain');
        const targetPath = event.target.textContent;
        if (event.target.classList.contains('directory')) {
            fetch('/file/move', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    old_path: `${currentDirectory}/${draggedFile}`,
                    new_path: `${currentDirectory}/${targetPath}/${draggedFile.split('/').pop()}`
                })
            }).then(() => fetchFiles());
        }
    }

    function dropToParent(event) {
        event.preventDefault();
        const draggedFile = event.dataTransfer.getData('text/plain');
        const parentDir = currentDirectory.split('/').slice(0, -1).join('/') || '.';
        fetch('/file/move', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                old_path: `${currentDirectory}/${draggedFile}`,
                new_path: `${parentDir}/${draggedFile.split('/').pop()}`
            })
        }).then(() => fetchFiles());
    }

    createFileButton.addEventListener('click', () => {
        const fileName = prompt('Enter the new file name:');
        if (fileName) {
            fetch('/file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    path: currentDirectory,
                    name: fileName,
                    type: 'file'
                })
            }).then(() => fetchFiles());
        }
    });

    createDirButton.addEventListener('click', () => {
        const dirName = prompt('Enter the new directory name:');
        if (dirName) {
            fetch('/file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    path: currentDirectory,
                    name: dirName,
                    type: 'directory'
                })
            }).then(() => fetchFiles());
        }
    });

    renameButton.addEventListener('click', () => {
        if (!selectedFile) {
            alert('Select a file or directory to rename.');
            return;
        }
        const newName = prompt('Enter the new name:', selectedFile.textContent);
        if (newName) {
            fetch('/file', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    old_path: `${currentDirectory}/${selectedFile.textContent}`,
                    new_path: `${currentDirectory}/${newName}`
                })
            }).then(() => fetchFiles());
        }
    });

    deleteButton.addEventListener('click', () => {
        if (!selectedFile) {
            alert('Select a file or directory to delete.');
            return;
        }
        fetch('/file', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: `${currentDirectory}/${selectedFile.textContent}`
            })
        }).then(() => fetchFiles());
    });

    saveButton.addEventListener('click', () => {
        if (!selectedFile || selectedFile.classList.contains('directory')) {
            alert('Select a file to save.');
            return;
        }
        fetch('/file/content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: `${currentDirectory}/${selectedFile.textContent}`,
                content: editor.getValue()
            })
        });
    });

    fetchFiles();
});
