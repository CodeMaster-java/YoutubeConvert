# YoutubeConvert

Aplicativo desktop para baixar e converter vídeos do YouTube em MP3/MP4. Frontend em Electron, backend em FastAPI usando yt-dlp, com seleção de pasta, miniatura do vídeo, progresso em tempo real e cancelamento.

## Visão Geral
- **Frontend**: Electron + HTML/CSS/JS (renderer) consumindo API local.
- **Backend**: FastAPI com yt-dlp para download/conversão; requisições HTTP (localhost:8765).
- **Pós-processamento**: FFmpeg/ffprobe para extrair MP3 e muxar MP4.

## Funcionalidades
- Download de vídeos YouTube em MP3 ou MP4.
- Seleção de pasta de destino e cancelamento em andamento.
- Miniatura automática ao colar a URL.
- Progresso e status em tempo real.

## Requisitos
- Python 3.11+ (backend).
- Node 18+ (frontend/Electron).
- FFmpeg/ffprobe disponíveis no PATH.

## Instalação
1) Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # ou .venv\Scripts\activate no Windows
pip install -r requirements.txt
```

2) Frontend
```bash
cd ../frontend
npm install
```

## Execução (dev)
```bash
cd frontend
npm run start
```
O Electron sobe e inicia o backend automaticamente (porta 8765).

## Empacotamento
Pré-requisitos: Node 18+, dependências já instaladas (`npm install`), FFmpeg no PATH. Em Linux, instale `libxcrypt-compat` para o build RPM.

### Fedora (RPM)
```bash
cd frontend
npm run dist -- --linux rpm
```
Saída: `frontend/dist/youtubeconvert-electron-0.1.0.x86_64.rpm`.

### Windows (.exe)
Em um host Windows (ou Linux com Wine + Mono):
```bash
cd frontend
npm run dist -- --win --x64
```
Saída: `frontend/dist/YouTubeConverter-Setup-0.1.0.exe`.

## Uso
- Cole a URL do YouTube (miniatura aparece se válida).
- Escolha formato (MP3/MP4), qualidade e pasta de destino.
- Inicie o download; acompanhe progresso; use cancelar se necessário.

## Estrutura
- `backend/app.py` – API FastAPI (endpoints: `/downloads`, `/downloads/{id}`, `/downloads/{id}/cancel`, `/health`).
- `backend/downloader.py` – Serviço de download/conversão com yt-dlp.
- `backend/requirements.txt` – Dependências do backend.
- `frontend/main.js` – Processo principal do Electron; inicia o backend.
- `frontend/preload.js` – Bridge segura para o renderer.
- `frontend/renderer/` – UI (HTML/CSS/JS).

## Comandos úteis
- Rodar backend isolado: `cd backend && source .venv/bin/activate && uvicorn app:app --reload --host 127.0.0.1 --port 8765`
- Rodar frontend: `cd frontend && npm run start`

## Solução de problemas
- **FFmpeg/ffprobe não encontrados**: instale via gerenciador. Ex.: Debian/Ubuntu `sudo apt-get install ffmpeg`; Fedora (RPM Fusion) `sudo dnf swap -y ffmpeg-free ffmpeg --allowerasing`.
- **Import errors no VS Code**: selecione o Python de `backend/.venv` ou defina em `.vscode/settings.json`.

## Licença
MIT – veja `LICENSE`.