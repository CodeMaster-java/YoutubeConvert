const { contextBridge, ipcRenderer } = require('electron');

const API_URL = 'http://127.0.0.1:8765';

contextBridge.exposeInMainWorld('api', {
  startDownload: async (payload) => {
    const res = await fetch(`${API_URL}/downloads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  getStatus: async (id) => {
    const res = await fetch(`${API_URL}/downloads/${id}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  cancelDownload: async (id) => {
    const res = await fetch(`${API_URL}/downloads/${id}/cancel`, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  selectFolder: async () => ipcRenderer.invoke('select-folder')
});
