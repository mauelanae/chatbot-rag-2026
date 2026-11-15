import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from services.document_processor import DocumentProcessor
from services.knn_retriever import KNNRetriever
from services.llm_service import LLMService

app = Flask(__name__)
CORS(app) # Izinkan akses dari React Frontend

# Inisialisasi Service
knn_retriever = KNNRetriever()
llm_service = LLMService()

os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(Config.STORAGE_FOLDER, exist_ok=True)

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ready", "total_chunks": len(knn_retriever.chunks)})

@app.route("/api/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "Tidak ada file yang dikirim"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Nama file kosong"}), 400

    filename = file.filename
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in Config.ALLOWED_EXTENSIONS:
        return jsonify({"error": f"Format file .{ext} tidak diizinkan. Gunakan pdf, docx, atau txt."}), 400

    save_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(save_path)

    try:
        #1. Ekstrak teks
        extracted_text = DocumentProcessor.extract_text(save_path)
        #2. Chunking teks
        new_chunks = DocumentProcessor.chunk_text(extracted_text)
        if not new_chunks:
            return jsonify({"error": "File kosong atau teks tidak terbaca"}), 400
        #3. Latih & upload model KNN
        knn_retriever.build_index(new_chunks)

        return jsonify({
            "message": f"File {filename} berhasil diproses!",
            "new_chunks_count": len(new_chunks),
            "total_chunks_stored": len(knn_retriever.chunks)
            }), 200
    except Exception as e:
        return jsonify({"error": f"Gagal memproses dokumen: {str(e)}"}), 500

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or "question" not in data:
        return jsonify({"error": "Pertanyaan wajib diisi"}), 400
        
    question = data["question"].strip()
    if not question:
        return jsonify({"error": "Pertanyaan tidak boleh kosong"}), 400

    # [R] RETRIEVAL: Cari potongan materi terdekat dengan KNN
    # 1. KNN Retrieval: Cari chunk materi terdekat
    relevant_chunks = knn_retriever.retrieve(question)

    # [A + G] AUGMENTED & GENERATION: Masukkan materi ke prompt lalu generate jawaban
    # 2. LLM Generation via 9router
    answer = llm_service.generate_answer(question, relevant_chunks)
    
    return jsonify({
        "question": question,
        "answer": answer,
        "retrieved_context_count": len(relevant_chunks)
    })
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)