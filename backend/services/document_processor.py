import os
from pypdf import PdfReader
from docx import Document

class DocumentProcessor:
    @staticmethod
    def extract_text(file_path: str) -> str:
        """Mengekstrak seluruh teks dari file PDF, DOCX."""
        ext = file_path.rsplit(".", 1)[-1].lower()
        text = ""

        if ext == "pdf":
            reader = PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        elif ext == "docx":
            doc = Document(file_path)
            for p in doc.paragraphs:
                if p.text:
                    text += p.text + "\n"
        elif ext == "txt":
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
        else:
            raise ValueError(f"Ekstensi file .{ext} tidak didukung.")
            
        return text

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> list[str]:
        """
        Memecah teks panjang menjadi beberapa chunks.
        Chunking penting agar KNN dapat menemukan bagian spesifik materi
        dan tidak melebihi batas token context LLM.
        """
        words = text.split()
        if not words:
            return []
            
        chunks = []
        start = 0
        while start < len(words):
            end = start + chunk_size
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            start += (chunk_size - overlap)
            
        return chunks