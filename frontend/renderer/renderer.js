const urlInput = document.getElementById('url');
const fmtSelect = document.getElementById('fmt');
const qualitySelect = document.getElementById('quality');
const outputInput = document.getElementById('output');
const chooseFolderBtn = document.getElementById('choose-folder');
const playlistCheckbox = document.getElementById('playlist');
const downloadBtn = document.getElementById('download');
const cancelBtn = document.getElementById('cancel');
const progressEl = document.getElementById('progress');
const barEl = document.getElementById('bar');
const statusEl = document.getElementById('status');
const thumbWrapper = document.getElementById('thumb');
const thumbImg = document.getElementById('thumb-img');

thumbImg.loading = 'lazy';
thumbImg.decoding = 'async';

let currentId = null;
let timer = null;

function setStatus(text) {
  statusEl.textContent = text;
}

function setProgress(value) {
  progressEl.hidden = false;
  const pct = Math.max(0, Math.min(value, 1));
  barEl.style.width = `${(pct * 100).toFixed(1)}%`;
}

function clearProgress() {
  barEl.style.width = '0%';
  progressEl.hidden = true;
}

function resetUI() {
  downloadBtn.disabled = false;
  cancelBtn.disabled = true;
  currentId = null;
  clearInterval(timer);
  timer = null;
  clearProgress();
}

downloadBtn.addEventListener('click', async () => {
  const payload = {
    url: urlInput.value.trim(),
    fmt: fmtSelect.value,
    quality: qualitySelect.value,
    output_path: outputInput.value.trim(),
    playlist: playlistCheckbox.checked
  };
  if (!payload.url) {
    setStatus('Informe a URL.');
    return;
  }
  if (!payload.output_path) {
    setStatus('Informe a pasta de destino.');
    return;
  }
  downloadBtn.disabled = true;
  cancelBtn.disabled = false;
  setStatus('Iniciando...');
  progressEl.hidden = true;
  try {
    const { id } = await window.api.startDownload(payload);
    currentId = id;
    pollStatus();
  } catch (err) {
    setStatus(`Erro: ${err}`);
    resetUI();
  }
});

cancelBtn.addEventListener('click', async () => {
  if (!currentId) return;
  await window.api.cancelDownload(currentId);
  setStatus('Cancelando...');
});

function pollStatus() {
  timer = setInterval(async () => {
    if (!currentId) return;
    try {
      const data = await window.api.getStatus(currentId);
      setProgress(data.progress || 0);
      setStatus(data.status || '');
      if (data.done) {
        setStatus(`Concluído: ${data.filename}`);
        setTimeout(() => setStatus(''), 1800);
        resetUI();
      }
      if (data.error) {
        setStatus(`Erro: ${data.error}`);
        resetUI();
      }
    } catch (err) {
      setStatus(`Erro: ${err}`);
      resetUI();
    }
  }, 800);
}

chooseFolderBtn.addEventListener('click', async () => {
  const folder = await window.api.selectFolder();
  if (folder) {
    outputInput.value = folder;
    setStatus('');
  }
});

function extractVideoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

function updateThumbnail(url) {
  const id = extractVideoId(url);
  if (!id) {
    thumbWrapper.hidden = true;
    thumbImg.src = '';
    return;
  }
  const src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  thumbImg.onload = () => {
    thumbWrapper.hidden = false;
  };
  thumbImg.onerror = () => {
    thumbWrapper.hidden = true;
  };
  thumbImg.src = src;
}

urlInput.addEventListener('input', () => {
  updateThumbnail(urlInput.value.trim());
});
