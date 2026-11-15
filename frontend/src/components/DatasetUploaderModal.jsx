import React, { useState } from 'react';
import { UploadCloud, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function DatasetUploaderModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  if (!isOpen) return null;

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: 'success',
          message: data.message || `File ${file.name} berhasil diproses dan diindeks!`
        });
        setFile(null);
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Gagal memproses file'
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      setStatus({
        type: 'error',
        message: 'Gagal terhubung ke backend server (localhost:5000).'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white w-full max-w-[92vw] sm:max-w-md rounded-2xl shadow-2xl border border-gray-100 p-5 sm:p-6 relative max-h-[90dvh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Upload Modul PLH</h3>
            <p className="text-[11px] sm:text-xs text-gray-500">Dukungan: PDF, DOCX, TXT</p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-xl p-5 text-center transition-colors bg-gray-50/50">
            <input
              type="file"
              id="dataset-file-mobile"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="dataset-file-mobile" className="cursor-pointer flex flex-col items-center">
              <FileText className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[200px]">
                {file ? file.name : 'Pilih file dokumen'}
              </span>
              <span className="text-[11px] text-gray-400 mt-1">Ketuk untuk memilih file</span>
            </label>
          </div>

          {status && (
            <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
              <span className="leading-tight">{status.message}</span>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!file || loading}
              className="px-4 py-2 text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Upload & Ekstrak'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
