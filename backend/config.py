import os
from pathlib import Path

from dotenv import load_dotenv

# Muat .env secara eksplisit dari folder file ini (backend/), bukan dari CWD.
# Tanpa ini, `python backend/config.py` dari root proyek bisa gagal membaca .env.
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

class Config:
    ROUTER9_API_KEY = os.getenv("ROUTER9_API_KEY")
    ROUTER9_API_URL = os.getenv("ROUTER9_API_URL")
    ROUTER9_MODEL_NAME = os.getenv("ROUTER9_MODEL_NAME")

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    STORAGE_FOLDER = os.path.join(BASE_DIR, "storage")

    ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}
    TOP_K_NEIGHBORS = 4 # Jumlah chunk terdekat yang dicari oleh KNN (lebih banyak konteks)