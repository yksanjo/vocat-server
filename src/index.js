const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Command Executor
function executeCommand(cmd) {
  return new Promise((resolve) => {
    const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/sh';
    const child = spawn(shell, ['-c', cmd], {
      cwd: process.env.WORKING_DIR || process.cwd()
    });
    
    let stdout = '', stderr = '';
    
    child.stdout?.on('data', d => stdout += d.toString());
    child.stderr?.on('data', d => stderr += d.toString());
    
    child.on('close', code => {
      resolve({
        success: code === 0,
        output: stdout,
        error: stderr || undefined,
        exitCode: code || 0
      });
    });
    
    child.on('error', err => {
      resolve({ success: false, output: '', error: err.message, exitCode: 1 });
    });
  });
}

// Git Operations
async function gitStatus() {
  const result = await executeCommand('git status --porcelain');
  return result;
}

async function gitCommit(msg) {
  await executeCommand('git add -A');
  return await executeCommand(`git commit -m "${msg}"`);
}

async function gitPush() {
  return await executeCommand('git push');
}

async function gitPull() {
  return await executeCommand('git pull');
}

// TTS
function speak(text, voice = 'Daniel') {
  return executeCommand(`say -v "${voice}" "${text}"`);
}

// Routes
app.post('/api/execute', async (req, res) => {
  const { command } = req.body;
  console.log(`Executing: ${command}`);
  const result = await executeCommand(command);
  res.json(result);
});

app.get('/api/status', async (req, res) => {
  const result = await gitStatus();
  res.json(result);
});

app.post('/api/git/commit', async (req, res) => {
  const { message } = req.body;
  const result = await gitCommit(message);
  res.json(result);
});

app.post('/api/git/push', async (req, res) => {
  const result = await gitPush();
  res.json(result);
});

app.post('/api/git/pull', async (req, res) => {
  const result = await gitPull();
  res.json(result);
});

app.post('/api/speak', async (req, res) => {
  const { text, voice } = req.body;
  await speak(text, voice);
  res.json({ success: true });
});

app.get('/api/voices', (req, res) => {
  res.json([
    { id: 'Daniel', name: 'Daniel (Jarvis)' },
    { id: 'Samantha', name: 'Samantha' },
    { id: 'Zarvox', name: 'Zarvox (Peon)' },
    { id: 'Alex', name: 'Alex' }
  ]);
});

// WebSocket for streaming output
const wss = new WebSocketServer({ port: PORT + 1 });
wss.on('connection', ws => {
  console.log('WebSocket client connected');
  ws.on('message', async (msg) => {
    const { command } = JSON.parse(msg);
    const result = await executeCommand(command);
    ws.send(JSON.stringify(result));
  });
});

app.listen(PORT, () => {
  console.log(`🎙️ VoCAT Server running on http://localhost:${PORT}`);
  console.log(`WebSocket running on ws://localhost:${PORT + 1}`);
});
