document.addEventListener('DOMContentLoaded', () => {
    const fileBrowser = document.getElementById('file-browser');
    const editorElement = document.getElementById('editor');
    const createFileButton = document.getElementById('create-file');
    const createDirButton = document.getElementById('create-dir');
    const renameButton = document.getElementById('rename');
    const deleteButton = document.getElementById('delete');
    const saveButton = document.getElementById('save');

    const parentDropArea = document.createElement('div');
    parentDropArea.textContent = "Move to Parent Directory";
    parentDropArea.classList.add('parent-drop-area');
    parentDropArea.addEventListener('click', goBack);
    parentDropArea.addEventListener('dragover', dragOver);
    parentDropArea.addEventListener('drop', dropToParent);
    fileBrowser.appendChild(parentDropArea);
    let currentDirectory = '.';
    let selectedFile = null;

    // Add this near the top of your script.js file
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
        extraKeys: {"Ctrl-Space": "autocomplete"},  // Changed from Tab to Ctrl-Space
        hintOptions: {
            hint: pythonHint
        }
    });

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
                    column: cursor.ch
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

    // Add this to handle custom rendering of completions
    CodeMirror.registerHelper("hint", "python", function(cm) {
        return cm.getHelper(cm.getCursor(), "hint").hint(cm);
    });

    // Add this to customize the appearance of the autocomplete dropdown
    CodeMirror.registerHelper("hint", "anyword", function(cm, options) {
        var cursor = cm.getCursor(), token = cm.getTokenAt(cursor);
        var to = CodeMirror.Pos(cursor.line, token.end);
        if (token.string && /\w/.test(token.string[token.string.length - 1])) {
            var term = token.string, from = CodeMirror.Pos(cursor.line, token.start);
        } else {
            var term = "", from = to;
        }
        var found = options.list.filter(function(item) {
            return item.text.indexOf(term) == 0;
        });
        if (found.length) return {list: found, from: from, to: to};
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
