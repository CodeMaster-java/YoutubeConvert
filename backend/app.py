from __future__ import annotations

import os
import sys
from threading import Event, Thread
from typing import Dict, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:  # noqa: WPS501
    from .downloader import DownloadRequest, Downloader
except Exception:  # noqa: BLE001
    sys.path.append(os.path.dirname(__file__))
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir)))
    from backend.downloader import DownloadRequest, Downloader


class StartPayload(BaseModel):
    url: str = Field(..., min_length=5)
    fmt: str = Field(..., pattern="^(mp3|mp4)$")
    quality: str = Field(..., pattern=r"^\d{2,3}$")
    output_path: str
    playlist: bool = False


app = FastAPI(title="YoutubeConvert API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tasks: Dict[str, dict] = {}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/downloads")
def start_download(payload: StartPayload):
    if not os.path.isdir(payload.output_path):
        try:
            os.makedirs(payload.output_path, exist_ok=True)
        except OSError as exc:  # noqa: BLE001
            raise HTTPException(status_code=400, detail=f"Diretório inválido: {exc}") from exc

    download_id = str(uuid4())
    cancel_event = Event()
    tasks[download_id] = {
        "progress": 0.0,
        "status": "starting",
        "done": False,
        "error": None,
        "filename": None,
        "cancel": cancel_event,
    }

    def progress_cb(percent: float, status: Optional[str]):
        tasks[download_id]["progress"] = max(0.0, min(percent, 1.0))
        tasks[download_id]["status"] = status or ""

    def worker():
        try:
            downloader = Downloader(progress_cb=progress_cb, cancel_event=cancel_event)
            filename = downloader.download(
                DownloadRequest(
                    url=payload.url,
                    fmt=payload.fmt,
                    quality=payload.quality,
                    output_path=payload.output_path,
                    playlist=payload.playlist,
                )
            )
            tasks[download_id]["done"] = True
            tasks[download_id]["filename"] = filename
            tasks[download_id]["status"] = "finished"
        except Exception as exc:  # noqa: BLE001
            tasks[download_id]["error"] = str(exc)
            tasks[download_id]["status"] = "error"
        finally:
            tasks[download_id]["progress"] = tasks[download_id].get("progress", 0.0)

    Thread(target=worker, daemon=True).start()
    return {"id": download_id}


@app.get("/downloads/{download_id}")
def get_status(download_id: str):
    task = tasks.get(download_id)
    if not task:
        raise HTTPException(status_code=404, detail="Download não encontrado")
    return {
        "progress": task["progress"],
        "status": task["status"],
        "done": task["done"],
        "error": task["error"],
        "filename": task["filename"],
    }


@app.post("/downloads/{download_id}/cancel")
def cancel(download_id: str):
    task = tasks.get(download_id)
    if not task:
        raise HTTPException(status_code=404, detail="Download não encontrado")
    task["cancel"].set()
    task["status"] = "cancelling"
    return {"status": "cancelling"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="127.0.0.1", port=8765, reload=False)
