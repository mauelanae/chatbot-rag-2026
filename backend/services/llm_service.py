import json
from openai import OpenAI
from config import Config

class LLMService:
    def __init__(self):
        # 9router menggunakan antarmuka standar OpenAI
        self.client = OpenAI(api_key=Config.ROUTER9_API_KEY, base_url=Config.ROUTER9_API_URL)

    def generate_answer(self, question: str, retrived_context: list[str]) -> dict:
        """
        Mengirimkan konteks hasil pencarian KNN dan pertanyaan siswa ke LLM.
        Mengembalikan dictionary berisi answer dan flag is_out_of_context.
        """
        context_str = "\n\n---\n\n".join(retrived_context) if retrived_context else "Tidak ada materi yang tersedia."

        system_prompt = (
            "Kamu adalah asisten guru cerdas, ramah, dan penyayang untuk mata pelajaran Pendidikan Lingkungan Hidup (PLH) tingkat SD/MI.\n"
            "Tugas utamamu adalah HANYA menjawab pertanyaan berdasarkan Konteks Materi PLH yang disediakan.\n\n"
            "ATURAN KETAT DAN PANDUAN KERJA:\n"
            "1. Periksa secara teliti apakah jawaban atas pertanyaan siswa ada atau terkait langsung dengan Konteks Materi PLH yang diberikan.\n\n"
            "2. JIKA PERTANYAAN DI LUAR MATERI MODUL PLH (contoh: bagian tubuh manusia/panca indra, matematika/berhitung, sejarah/tokoh, olahraga, resep makanan, pengetahuan umum lain yang tidak tercantum dalam modul):\n"
            "   - Set \"is_out_of_context\": true\n"
            "   - DILARANG KERAS menjawab isi materi tersebut menggunakan pengetahuan umummu!\n"
            "   - Berikan respon penolakan yang sopan, ramah, bersahabat, dan edukatif untuk anak SD/MI.\n"
            "   - Berikan arahan atau rekomendasi mata pelajaran yang tepat untuk mempelajari hal tersebut secara jelas.\n"
            "     Contoh: jika ditanya organ tubuh/indra pencium bau -> arahkan ke pelajaran IPA (Ilmu Pengetahuan Alam).\n"
            "     Contoh: jika ditanya hitungan/rumus -> arahkan ke pelajaran Matematika.\n"
            "     Contoh: jika ditanya sejarah/kerajaan/pahlawan -> arahkan ke pelajaran IPS (Ilmu Pengetahuan Sosial).\n\n"
            "3. JIKA PERTANYAAN ADA DALAM MATERI MODUL PLH:\n"
            "   - Set \"is_out_of_context\": false\n"
            "   - Jawablah secara LENGKAP, JELAS, TERSTRUKTUR, dan HANYA bersumber dari materi yang ada di konteks.\n\n"
            "4. ATURAN STRUKTUR & FORMAT JAWABAN (SANGAT PENTING - WAJIB DIPATUHI):\n"
            "   - DILARANG KERAS membuat jawaban berupa satu blok teks panjang yang menyatu!\n"
            "   - Format teks harus sangat rapi, nyaman dibaca, dan mudah dipahami manusia/murid SD:\n"
            "     a. Kalimat Pembuka: Tuliskan penjelasan ringkas atau kalimat pengantar di awal.\n"
            "     b. Poin-Poin Terstruktur: Bila materi memuat beberapa unsur, jenis, contoh, klasifikasi, karakteristik, fungsi, atau langkah upaya, WAJIB dibuat dalam bentuk poin-poin berurutan (1., 2., 3.) atau daftar strip (-).\n"
            "     c. Setiap poin WAJIB berada di baris baru tersendiri.\n"
            "     d. Gunakan penekanan kata kunci tebal (**kata kunci**) pada awal setiap poin agar mudah dipindai mata pembaca (contoh: '- **Produsen**: organisme yang...').\n"
            "     e. Berikan jeda baris kosong antar-kelompok penjelasan agar tidak padat bertumpuk.\n\n"
            "5. FORMAT OUTPUT:\n"
            "Wajib mengeluarkan format JSON valid tanpa teks pengantar lainnya:\n"
            "{\n"
            "  \"is_out_of_context\": true/false,\n"
            "  \"answer\": \"isi jawaban atau respon ramah bot\"\n"
            "}"
        )

        user_prompt = f"""Konteks Materi PLH:
{context_str}

Pertanyaan Siswa:
{question}

Keluarkan respon hanya dalam format JSON:"""

        try:
            response = self.client.chat.completions.create(
                model=Config.ROUTER9_MODEL_NAME,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2, # Rendah agar patuh konteks dan format JSON
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            raw_content = response.choices[0].message.content or "{}"
            
            # Parsing JSON dari LLM
            parsed = json.loads(raw_content)
            answer_text = parsed.get("answer", "")
            is_out = bool(parsed.get("is_out_of_context", False))

            # Pembersihan tambahan agar tidak ada simbol hashtag (###) yang lolos
            cleaned_answer = (
                answer_text
                .replace("### ", "")
                .replace("## ", "")
                .replace("# ", "")
                .strip()
            )

            return {
                "answer": cleaned_answer,
                "is_out_of_context": is_out
            }

        except json.JSONDecodeError:
            # Fallback jika json parsing gagal
            cleaned = (
                raw_content
                .replace("**", "")
                .replace("### ", "")
                .replace("## ", "")
                .replace("# ", "")
                .strip()
            )
            return {
                "answer": cleaned,
                "is_out_of_context": False
            }
        except Exception as e:
            return {
                "answer": f"Terjadi kendala saat menghubungi asisten AI: {str(e)}",
                "is_out_of_context": False
            }