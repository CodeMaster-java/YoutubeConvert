from __future__ import annotations

import os
from dataclasses import dataclass
from threading import Event
from typing import Callable, Optional

import yt_dlp


ProgressCallback = Callable[[float, Optional[str]], None]


@dataclass(frozen=True)
class DownloadRequest:
    url: str
    fmt: str
    quality: str
    output_path: str
    playlist: bool = False


class Downloader:
    def __init__(self, progress_cb: ProgressCallback, cancel_event: Event):
        self.progress_cb = progress_cb
        self.cancel_event = cancel_event

    def download(self, request: DownloadRequest) -> str:
        def hook(data: dict) -> None:
            if self.cancel_event.is_set():
                raise yt_dlp.utils.DownloadError('Download cancelado pelo usuário.')
            if data.get('status') == 'downloading':
                total = data.get('total_bytes') or data.get('total_bytes_estimate') or 1
                downloaded = data.get('downloaded_bytes', 0)
                percent = min(downloaded / total, 1.0)
                self.progress_cb(percent, f"Baixando: {int(percent * 100)}%")
            elif data.get('status') == 'finished':
                self.progress_cb(1.0, 'Processando arquivo...')

        ydl_opts = self._build_options(request, hook)
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=True)
            filename = self._resolve_filename(ydl, info, request.fmt)
            self.progress_cb(1.0, 'Download concluído!')
            return filename

    @staticmethod
    def _build_options(request: DownloadRequest, hook: ProgressCallback) -> dict:
        is_mp3 = request.fmt == 'mp3'
        options = {
            'progress_hooks': [hook],
            'format': 'bestaudio/best' if is_mp3 else 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
            'outtmpl': os.path.join(request.output_path, '%(title)s.%(ext)s'),
            'quiet': True,
            'noplaylist': not request.playlist,
            'merge_output_format': 'mp4' if not is_mp3 else None,
        }
        if is_mp3:
            options['postprocessors'] = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': request.quality,
            }]
        return options

    @staticmethod
    def _resolve_filename(ydl: yt_dlp.YoutubeDL, info: dict, fmt: str) -> str:
        raw_name = ydl.prepare_filename(info)
        if fmt == 'mp3':
            return os.path.splitext(raw_name)[0] + '.mp3'
        return raw_name