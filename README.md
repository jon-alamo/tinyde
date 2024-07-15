
# Tinyde

Tinyde is a lightweight, web-based, Python-backed editor that includes a simple file browser. The Python backend, powered by Flask, serves a REST API for filesystem operations and provides an autocompletion feature. The web UI is a simple layout in HTML, styled with a CSS module.

## Features

- **File Browser**: Navigate your directories and files with an intuitive UI.
- **File Operations**: Create, rename, delete, and move files and directories.
- **Code Editor**: Edit your Python files with syntax highlighting and auto-completion.
- **Autocompletion**: Access Python builtins and custom modules with the help of Jedi.
- **Customizable Title**: Define the header title from the command line.

## Installation

1. **Clone the Repository**:
   ```sh
   pip install git+https://github.com/jon-alamo/tinyde.git
   ```

## Usage

1. **Run the Command Line Tool**:
   ```sh
   tinyde --port 5001 --title "My Custom Title"
   ```

2. **Access the Web Interface**:
   Open your web browser and navigate to `http://127.0.0.1:5001`.


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

