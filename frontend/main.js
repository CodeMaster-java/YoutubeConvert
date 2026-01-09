const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess = null;

function resolvePythonCommand() {
  if (process.env.PYTHON) return process.env.PYTHON;
  return process.platform === 'win32' ? 'python' : 'python3';
}

function startBackend() {
  const pyCmd = resolvePythonCommand();
  const backendPath = path.join(__dirname, '..', 'backend', 'app.py');
  backendProcess = spawn(pyCmd, [backendPath], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  backendProcess.on('error', (err) => {
    dialog.showErrorBox('Backend error', String(err));
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 960,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

   ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    });
    if (result.canceled || !result.filePaths.length) return null;
    return result.filePaths[0];
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (backendProcess) backendProcess.kill();
});
