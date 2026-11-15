from openai import OpenAI
from config import Config

class LLMService:
    def __init__(self):
        # 9router menggunakan antarmuka standar OpenAI
        self.client = OpenAI(api_key=Config.ROUTER9_API_KEY, base_url=Config.ROUTER9_API_URL)

    def generate_answer(self, question: str, retrived_context: list[str]) -> str:
        """
        Mengirimkan konteks hasil pencarian KNN dan pertanyaan siswa ke LLM.
        """
        context_str = "\n\n---\n\n".join(retrived_context)

        system_prompt = (
            "Kamu adalah asisten guru cerdas dan ramah untuk mata pelajaran Pendidikan Lingkungan Hidup (PLH) kelas VI SD/MI. "
            "Tugasmu adalah memberikan penjelasan yang jelas, mendidik, terstruktur rapi, dan mudah dipahami anak usia SD/MI.\n\n"
            "Panduan menjawab:\n"
            "1. Sesuaikan panjang dan kedalaman jawaban secara proporsional dengan jenis pertanyaan:\n"
            "   - Jika siswa meminta penjelasan materi, bab, rangkuman, atau konsep umum (contoh: 'jelaskan materi BAB 2', 'apa saja upaya...'): "
            "berikan penjelasan yang LENGKAP, TERSTRUKTUR, dan MENYELURUH sesuai seluruh materi yang ada di konteks. Jangan memotong penjelasan penting.\n"
            "   - Jika siswa menanyakan hal spesifik atau singkat (contoh: 'apa contoh komponen abiotik...'): "
            "jawab langsung ke inti pertanyaan secara padat dan jelas.\n"
            "2. ATURAN FORMAT PENULISAN (SANGAT PENTING):\n"
            "   - DILARANG KERAS menggunakan format markdown tebal dengan tanda bintang ganda (**tebal**).\n"
            "   - DILARANG menggunakan tanda pagar (###) untuk heading/judul.\n"
            "   - DILARANG menyisipkan icon atau emoji di dalam isi penjelasan materi.\n"
            "   - Tuliskan jawaban dalam format teks polos (plain text) yang bersih dan rapi.\n"
            "   - Gunakan huruf kapital atau penomoran berurutan (1, 2, 3 atau a, b, c) dan tanda strip (-) untuk daftar poin agar nyaman dibaca siswa.\n"
            "3. Pastikan jawaban tuntas dan tidak terpotong di tengah kalimat.\n"
            "4. Jawablah HANYA berdasarkan konteks materi yang diberikan. Jangan mengarang informasi di luar konteks. "
            "Jika materi tidak ada sama sekali dalam konteks, katakan dengan sopan bahwa materi tersebut belum tercantum di modul ini."
        )

        user_prompt = f"""Konteks Materi PLH:
{context_str}

Pertanyaan Siswa:
{question}

Jawaban:"""

        try:
            response = self.client.chat.completions.create(
                model=Config.ROUTER9_MODEL_NAME,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3, # Rendah agar jawabannya faktual sesuai modul
                max_tokens=2000 # Cukup besar agar jawaban komprehensif tidak terpotong
            )
            raw_text = response.choices[0].message.content or ""
            # Pembersihan tambahan agar tidak ada simbol markdown tebal (**) atau hashtag (###) yang lolos
            cleaned_text = raw_text.replace("**", "").replace("### ", "").replace("## ", "").replace("# ", "")
            return cleaned_text
        except Exception as e:
            return f"Terjadi kendala saat menghubungi LLM (9router): {str(e)}"