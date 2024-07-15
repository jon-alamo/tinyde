
document.addEventListener('DOMContentLoaded', () => {
    const fileBrowser = document.getElementById('file-browser');
    const editorElement = document.getElementById('editor');
    const createFileButton = document.getElementById('create-file');
    const createDirButton = document.getElementById('create-dir');
    const renameButton = document.getElementById('rename');
    const deleteButton = document.getElementById('delete');
    const saveButton = document.getElementById('save');
    const fileNameElement = document.getElementById('file-name');
    const editorButtons = document.getElementById('editor-buttons');

    // Initially disable editor
    editorElement.style.pointerEvents = "none";
    editorElement.style.opacity = "0.5";
    editorButtons.style.pointerEvents = "none";
    editorButtons.style.opacity = "0.5";

    const parentDropArea = document.createElement('div');
    const parentIcon = document.createElement('img');
    parentIcon.src = '/static/images/folder.png';
    parentIcon.style.verticalAlign = 'middle';
    parentIcon.style.width = '16px';  // Reduced width
    parentIcon.style.height = '16px'; // Reduced height
    parentIcon.style.marginRight = '8px';

    parentDropArea.appendChild(parentIcon);
    parentDropArea.appendChild(document.createTextNode(" .. "));
    parentDropArea.classList.add('parent-drop-area');
    parentDropArea.addEventListener('click', goBack);
    parentDropArea.addEventListener('dragover', dragOver);
    parentDropArea.addEventListener('drop', dropToParent);
    fileBrowser.appendChild(parentDropArea);
    let currentDirectory = '.';
    let selectedFile = null;
    let currentOpenFile = null;
    let isFileModified = false;

    const imageUrls = {
        directory: '/static/images/folder.png',
        python: '/static/images/python_document.png',
        default: '/static/images/empty_document.png'
    };

    const pythonBuiltins = [
        'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'bytearray', 'bytes', 'callable',
        'chr', 'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir', 'divmod',
        'enumerate', 'eval', 'exec', 'filter', 'float', 'format', 'frozenset', 'getattr',
        'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance',
        'issubclass', 'iter', 'len', 'list', 'locals', 'map', 'max', 'memoryview', 'min',
        'next', 'object', 'oct', 'open', 'ord', 'pow', 'print', 'property', 'range',
        'repr', 'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod',
        'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip'
    ];

    let editor = CodeMirror(editorElement, {
        lineNumbers: true,
        mode: 'python',
        extraKeys: {
            "Tab": (cm) => {
                const cursor = cm.getCursor();
                const token = cm.getTokenAt(cursor);
                
                // Check if the cursor is right after a period
                if (token.string === '.') {
                    cm.showHint({completeSingle: false});
                } else {
                    cm.replaceSelection("\t");
                }
            }
        },
        hintOptions: {
            hint: pythonHint
        }
    });

    editor.on('change', () => {
        isFileModified = true;
        updateSaveButton();
    });

    function updateSaveButton() {
        if (isFileModified) {
            saveButton.disabled = false;
            saveButton.style.backgroundColor = '#FF6961'; // active state color
        } else {
            saveButton.disabled = true;
            saveButton.style.backgroundColor = '#999999'; // grayed out state color
        }
    }

    function pythonHint(editor, options) {
        return new Promise((resolve) => {
            const cursor = editor.getCursor();
            const source = editor.getValue();

            fetch('/autocomplete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    source: source,
                    line: cursor.line + 1,  // Jedi uses 1-based line numbers
                    column: cursor.ch,
                    file: currentOpenFile
                })
            })
            .then(response => response.json())
            .then(completions => {
                resolve({
                    list: completions.map(c => ({
                        text: c.name,
                        displayText: `${c.name} (${c.type})`,
                        description: c.description
                    })),
                    from: editor.getCursor(),
                    to: editor.getCursor()
                });
            });
        });
    }

    CodeMirror.registerHelper("hint", "python", function(cm) {
        return cm.getHelper(cm.getCursor(), "hint").hint(cm);
    });

    function getFileIcon(element, file) {
        let img = document.createElement('img');
        img.style.verticalAlign = 'middle';
        img.style.width = '20px';
        img.style.height = '20px';
        img.style.marginRight = '8px';

        const fileExtension = file.split('.').pop();
        if (fileExtension === file) {
            img.src = element.classList.contains('directory') ? imageUrls.directory : imageUrls.default;
        } else {
            switch (fileExtension) {
                case 'py':
                    img.src = imageUrls.python;
                    break;
                default:
                    img.src = imageUrls.default;
                    break;
            }
        }
        return img;
    }

    function fetchFiles() {
        fetch(`/files?path=${currentDirectory}`)
            .then(response => response.json())
            .then(data => {
                displayFiles(data);
            });
    }

    function displayFiles(files) {
        fileBrowser.innerHTML = '';
        fileBrowser.appendChild(parentDropArea);
        files.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.classList.add(file.type);

            const fileIcon = getFileIcon(fileElement, file.path);
            fileElement.appendChild(fileIcon);

            const fileText = document.createTextNode(file.path);
            fileElement.appendChild(fileText);

            fileElement.classList.add(file.type);
            fileElement.draggable = true;
            fileElement.addEventListener('click', () => {
                selectFile(fileElement, file.path);
            });
            fileElement.addEventListener('dblclick', () => {
                if (file.type === 'file') {
                    saveCurrentFile(() => openFile(file.path));
                } else if (file.type === 'directory') {
                    enterDirectory(file.path);
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

    function openFile(fileName) {
        const filePath = `${currentDirectory}/${fileName}`
        currentOpenFile = filePath;
        isFileModified = false;
        updateSaveButton();
        fileNameElement.textContent = filePath;
        fetch(`/file/content?path=${filePath}`)
            .then(response => response.json())
            .then(data => {
                editor.setValue(data.content);
                isFileModified = false;  // Reset the modified flag once the file is opened
                updateSaveButton();      // Update the save button accordingly
                // Enable editor when a file is opened
                editorElement.style.pointerEvents = "auto";
                editorElement.style.opacity = "1";
                editorButtons.style.pointerEvents = "auto";
                editorButtons.style.opacity = "1";
            });
    }

    function changeDirectory(directoryPath) {
        currentDirectory = directoryPath;
        fetchFiles();
    }

    function enterDirectory(directoryName) {
        changeDirectory(
            `${currentDirectory}/${directoryName}`
        );
    }

    function goBack() {
        if (currentDirectory !== '.') {
            const parentDir = currentDirectory.split('/').slice(0, -1).join('/');
            changeDirectory(parentDir === '' ? '.' : parentDir);
            fetchFiles();
        }
    }

    function saveCurrentFile(callback) {
        fetch('/file/content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: currentOpenFile,
                content: editor.getValue()
            })
        }).then(() => {
            isFileModified = false;
            updateSaveButton();
            callback();
        });
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
        saveCurrentFile(() => {});
    });

    fetchFiles();
    updateSaveButton(); // initial disable of save button
});
