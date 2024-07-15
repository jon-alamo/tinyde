

# Hapy-Addon

Hapy-Addon is a lightweight, web-based, Python-backed editor that includes a simple file browser. The Python backend, powered by Flask, serves a REST API for filesystem operations and provides an autocompletion feature. The web UI is a simple layout in HTML, styled with a CSS module.

## Features

- **File Browser**: Navigate your directories and files with an intuitive UI.
- **File Operations**: Create, rename, delete, and move files and directories.
- **Code Editor**: Edit your Python files with syntax highlighting and auto-completion.
- **Autocompletion**: Access Python builtins and custom modules with the help of Jedi.

## Installation

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/username/hapy-addon.git
   cd hapy-addon
   ```

2. **Create a Virtual Environment**:
   ```sh
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies**:
   ```sh
   pip install -r requirements.txt
   ```

## Usage

1. **Run the Command Line Tool**:
   ```sh
   tinyde --port 5001
   ```

2. **Access the Web Interface**:
   Open your web browser and navigate to `http://127.0.0.1:5001`.

## Project Structure

```
├── requirements.txt        # Dependencies for the project
├── README.md               # Project documentation
├── static/
│   ├── css/
│   │   └── style.css       # Styles for the web UI
│   └── js/
│       └── script.js       # Scripts for the web UI
├── hapy/
│   ├── automation.py       # Placeholder python file
│   ├── newdir/
│   │   └── subdir/
│   │       └── mynewfile.py  # Example Python file
│   └── script.py           # Example usage of `mynewfile`
├── tinyde/
│   ├── __init__.py         # Init file for the tinyde module
│   ├── cli.py              # Command line interface entry file
│   ├── webapp.py           # Main Flask application
│   └── file_operations.py  # File operations utility
├── templates/
│   └── index.html          # HTML template for the web interface
```

## API Endpoints

- `GET /files`: List files and directories.
- `POST /file`: Create a file or directory.
- `DELETE /file`: Delete a file or directory.
- `PUT /file`: Rename a file or directory.
- `PUT /file/move`: Move a file or directory.
- `GET /file/content`: Get the content of a file.
- `POST /file/content`: Save the content to a file.
- `POST /autocomplete`: Get autocompletion suggestions.

## Special Considerations

- **Autocompletion**: The autocomplete feature uses the Jedi library to provide suggestions. Make sure your code follows Python syntax standards to get the most out of this feature.
- **File System Operations**: Be careful with file operations like delete and rename. They directly affect your filesystem.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contributions

Contributions are welcome! Feel free to open an issue or submit a pull request.

