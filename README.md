# MindRoot Computer Use Server

A containerized environment for AI-controlled computer use, built on top of linuxserver/webtop. This server provides an API for controlling a virtual desktop environment, compatible with the Bytebot API used by MindRoot plugins.

## Features

- Full Ubuntu desktop with XFCE environment
- LibreOffice suite for document editing
- Firefox web browser
- Complete API for programmatic control
- Compatible with MindRoot Computer Use plugin

## API Endpoints

All endpoints are available at `/computer-use` base path.

### Keyboard Control

- `POST /key` - Send a key event (e.g., "enter", "ctrl-c")
- `POST /type` - Type text with optional delay

### Mouse Control

- `POST /mouse-move` - Move cursor to coordinates
- `POST /left-click` - Perform left click
- `POST /right-click` - Perform right click
- `POST /middle-click` - Perform middle click
- `POST /double-click` - Perform double click
- `POST /left-click-drag` - Perform click, drag, and release
- `POST /scroll` - Scroll vertically or horizontally

### Information

- `GET /screenshot` - Capture screenshot as base64 encoded image
- `GET /cursor-position` - Get current cursor position

## Building the Image

```bash
# Build the Docker image
docker build -t mindroot/computer-use:latest .

# Push to Docker Hub (if you have access)
docker push mindroot/computer-use:latest
```

## Running Locally

```bash
# Run the container
docker run -d --name=computer_use -p 3100:3100 -p 3001:3001 mindroot/computer-use:latest

# Access the API
curl http://localhost:3100/computer-use/cursor-position

# Access the desktop interface
# Open your browser to: http://localhost:3001
```

## Integration with MindRoot

This server is designed to be used with the MindRoot Computer Use plugin, providing AI agents with the ability to control a virtual desktop environment.

## License

MIT
