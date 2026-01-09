# YoutubeConvert

YoutubeConvert agora é composto por um backend Python (FastAPI + yt-dlp) e um frontend Electron, mantendo o download/conversão via `yt-dlp` e oferecendo uma UI moderna em HTML/CSS/JS.

## Funcionalidades

- **Download de vídeos do YouTube**: Insira a URL do vídeo e faça o download diretamente.
- **Conversão de formatos**: Converta vídeos para diferentes formatos de áudio e vídeo.
- **Interface moderna**: Interface gráfica intuitiva e personalizável.
- **Notificações**: Receba notificações sobre o status do download.

## Tecnologias Utilizadas

- **Python**: Linguagem principal do projeto.
- **FastAPI**: API local para orquestrar downloads.
- **yt-dlp**: Download/conversão de áudio/vídeo.
- **Electron**: Shell desktop para a UI web.

## Requisitos

Certifique-se de ter o Python 3.11+ e Node 18+ instalados.

## Como Usar (nova UI em Electron)

1. Backend Python (FastAPI)
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # ou .venv\\Scripts\\activate no Windows
   pip install -r requirements.txt
   ```

2. Frontend Electron
   ```bash
   cd ../frontend
   npm install
   npm run start
   ```

O processo Electron inicia e sobe o backend Python automaticamente. A interface web chama a API local (127.0.0.1:8765) para iniciar downloads, acompanhar progresso e cancelar.

## Estrutura do Projeto

- `backend/`: FastAPI + yt-dlp. Arquivo principal: `backend/app.py` e serviço de download em `backend/downloader.py`.
- `backend/requirements.txt`: Dependências do backend.
- `frontend/`: Electron (main/preload) e UI em `renderer/`.
- `frontend/package.json`: Scripts e dependências do Electron.
- `icone.ico`: Ícone reutilizável (opcional no Electron).

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.