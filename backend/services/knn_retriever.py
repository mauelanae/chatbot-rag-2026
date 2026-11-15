import os
import pickle
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sentence_transformers import SentenceTransformer
from config import Config

class KNNRetriever:
    def __init__(self):
        # Model embedding multilingual local (berjalan offline di CPU)
        self.encoder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
        self.knn_model = None
        self.chunks: list[str] = []
        self.model_path = os.path.join(Config.STORAGE_FOLDER, "knn_index.pkl")
        self._load_saved_index()

    def _load_saved_index(self):
        """Memuat index KNN dan chunk yang tersimpan jika ada."""
        if os.path.exists(self.model_path):
            with open(self.model_path, "rb") as f:
                data = pickle.load(f)
                self.knn_model = data["knn_model"]
                self.chunks = data["chunks"]

    def build_index(self, new_chunks: list[str]):
        """
        Menambahkan teks baru, mengubahnya menjadi vektor embedding,
        dan melatih model KNN untuk pencarian similarity.
        """
        self.chunks.extend(new_chunks)

        # 1. Ubah seluruh chunk text ke representasi vektor (embedding)
        vectors = self.encoder.encode(self.chunks, convert_to_numpy=True)

        # 2. Inisialisasi dan latih algoritma KNN
        k = min(Config.TOP_K_NEIGHBORS, len(self.chunks))
        self.knn_model = NearestNeighbors(n_neighbors=k, metric="cosine", algorithm="brute")
        self.knn_model.fit(vectors)

        # 3. Simpan ke disk
        os.makedirs(Config.STORAGE_FOLDER, exist_ok=True)
        with open(self.model_path, "wb") as f:
            pickle.dump({"knn_model": self.knn_model, "chunks": self.chunks}, f)

    def retrieve(self, query: str, top_k: int = Config.TOP_K_NEIGHBORS) -> list[str]:
        """
        Mencari top_k chunk teks yang paling relevan dengan pertanyaan user
        menggunakan prediksi tetangga terdekat KNN.
        """
        if not self.knn_model or not self.chunks:
            return []

        # Vektorisasi pertanyaan user
        query_vector = self.encoder.encode([query], convert_to_numpy=True)

        # Cari tetangga terdekat dengan query
        k = min(top_k, len(self.chunks))
        distances, indices = self.knn_model.kneighbors(query_vector, n_neighbors=k)

        # Ambil potongan teks materi hasil pencarian KNN
        retrieved_contexts = [self.chunks[idx] for idx in indices[0]]
        return retrieved_contexts
