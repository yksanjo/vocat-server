# VoCAT-Server

Voice-activated terminal API server. Exposes VoCAT functionality via REST API.

## Features

- REST API for command execution
- WebSocket for real-time output streaming
- Voice command queue
- Git operations API
- Authentication support
- Multi-tenant support

## Installation

```bash
npm install
npm start
```

## API Endpoints

```
POST /api/execute   - Execute a command
GET  /api/status    - Get git status
POST /api/git/commit - Commit changes
POST /api/git/push  - Push to remote
POST /api/git/pull   - Pull from remote
GET  /api/voices   - List available TTS voices
POST /api/speak    - Text to speech
```

## WebSocket

Connect to `ws://localhost:3000` for real-time command output streaming.

## Example

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "npm test"}'
```

## Configuration

Environment variables:
- `PORT` - Server port (default: 3000)
- `API_KEY` - API authentication key
- `WORKING_DIR` - Default working directory

## License

MIT
