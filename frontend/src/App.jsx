import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  MessageSquare,
  Send,
  Trash2,
  Menu,
  X,
  Sparkles,
  Bot,
  User,
  Database,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import DatasetUploaderModal from './components/DatasetUploaderModal';

const SUGGESTIONS = [
  'Apa perbedaan komponen biotik dan abiotik?',
  'Bagaimana cara memilah sampah organik dan anorganik?',
  'Apa manfaat melakukan reboisasi?',
  'Bagaimana cara menghemat energi di rumah?'
];

// Membersihkan simbol markdown mentah seperti ** atau ### agar teks bersih dan rapi
const formatCleanText = (text) => {
  if (!text) return '';
  return text
    .replaceAll('**', '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*\*\s+/gm, '- ');
};

export default function App() {
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('plh_conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const defaultId = Date.now().toString();
    return [
      {
        id: defaultId,
        title: 'Percakapan Baru',
        messages: []
      }
    ];
  });

  const [activeId, setActiveId] = useState(() => conversations[0]?.id || '');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0];

  useEffect(() => {
    localStorage.setItem('plh_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, loading]);

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'Percakapan Baru',
      messages: []
    };
    setConversations((prev) => [newChat, ...prev]);
    setActiveId(newChat.id);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (id, e) => {
    e.stopPropagation();
    if (conversations.length <= 1) {
      handleNewChat();
      setConversations((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    const filtered = conversations.filter((c) => c.id !== id);
    setConversations(filtered);
    if (activeId === id) {
      setActiveId(filtered[0].id);
    }
  };

  const sendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');
    const userMessage = { 
      sender: 'user', 
      text: query, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          const isFirstMessage = c.messages.length === 0;
          return {
            ...c,
            title: isFirstMessage ? (query.length > 22 ? query.substring(0, 22) + '...' : query) : c.title,
            messages: [...c.messages, userMessage]
          };
        }
        return c;
      })
    );

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });
      const data = await response.json();

      const botMessage = {
        sender: 'bot',
        text: data.answer || data.error || 'Maaf, terjadi kesalahan saat merespons.',
        contextCount: data.retrieved_context_count,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeId) {
            return {
              ...c,
              messages: [...c.messages, botMessage]
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        sender: 'bot',
        text: 'Koneksi ke backend Flask gagal. Pastikan server aktif di http://localhost:5000.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeId) {
            return {
              ...c,
              messages: [...c.messages, errorMessage]
            };
          }
          return c;
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-white text-gray-800 overflow-hidden font-sans">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Responsive */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 bg-gray-50 border-r border-gray-200 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3.5 flex flex-col h-full overflow-hidden">
          {/* Header Sidebar */}
          <div className="flex items-center justify-between mb-4 px-1.5 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <span className="font-semibold text-gray-900 tracking-tight text-base">PLH Assistant</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700 p-2 -mr-1 rounded-lg active:bg-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tombol New Chat */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2.5 w-full bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-800 text-sm font-medium px-3.5 py-3 rounded-xl border border-gray-200 shadow-2xs transition-all mb-4 text-left cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Chat Baru</span>
          </button>

          {/* Riwayat Chat */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 text-sm">
            <div className="px-2 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Riwayat Obrolan
            </div>
            {conversations.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setActiveId(chat.id);
                  setSidebarOpen(false);
                }}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors active:scale-[0.99] ${
                  chat.id === activeId
                    ? 'bg-emerald-50 text-emerald-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <MessageSquare className={`w-4 h-4 shrink-0 ${chat.id === activeId ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span className="truncate text-xs">{chat.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(chat.id, e)}
                  className="opacity-80 md:opacity-0 md:group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1.5 rounded transition-opacity"
                  title="Hapus percakapan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Tombol Buka Modal Upload */}
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setSidebarOpen(false);
              }}
              className="flex items-center gap-2.5 w-full text-xs font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200 px-3 py-3 rounded-xl transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Kelola Modul (RAG)</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-white">
        {/* Top Navbar */}
        <header className="h-14 border-b border-gray-100 flex items-center justify-between px-3 md:px-6 sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900 p-2 -ml-1 rounded-lg active:bg-gray-100"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-semibold text-gray-800 truncate max-w-[170px] sm:max-w-xs md:max-w-md">
              {activeConversation?.title || 'Percakapan Baru'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick New Chat Button on Mobile */}
            <button
              onClick={handleNewChat}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-lg"
              title="Chat Baru"
            >
              <Plus className="w-5 h-5 text-emerald-600" />
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              KNN RAG
            </span>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 md:px-0">
          <div className="max-w-2xl lg:max-w-3xl mx-auto space-y-4 md:space-y-6">
            {activeConversation?.messages.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-2 py-6">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 shadow-xs">
                  <Sparkles className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <h1 className="text-xl md:text-3xl font-semibold text-gray-900 mb-1.5">
                  Halo, Siswa Cerdas! 🌱
                </h1>
                <p className="text-xs md:text-sm text-gray-500 max-w-sm md:max-w-md mb-6 leading-relaxed">
                  Tanyakan materi seputar lingkungan, sampah, ekosistem, atau energi sesuai modul PLH kelas VI.
                </p>

                {/* Suggestions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg text-left">
                  {SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(s)}
                      className="p-3 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 active:bg-emerald-100/50 text-xs text-gray-700 font-medium flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <span className="line-clamp-2">{s}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 shrink-0 ml-1.5" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat Messages */
              activeConversation?.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 md:gap-3.5 ${
                    m.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.sender === 'bot' && (
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 md:px-4 md:py-3 text-xs md:text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-gray-100 text-gray-900 rounded-br-xs'
                        : 'bg-white border border-gray-100 text-gray-800 shadow-2xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{formatCleanText(m.text)}</div>

                    {m.contextCount > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center gap-1.5 text-[10px] md:text-[11px] text-gray-400 font-medium">
                        <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Dirangkum dari {m.contextCount} cuplikan modul</span>
                      </div>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex gap-2.5 md:gap-3.5 justify-start">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl px-3.5 py-2.5 text-xs text-gray-500 flex items-center gap-2 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                  <span>Membuka modul PLH & merangkum...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <div className="p-3 md:p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="max-w-2xl lg:max-w-3xl mx-auto relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan materi PLH..."
              className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-gray-900 text-base md:text-sm rounded-full pl-4 md:pl-5 pr-12 md:pr-14 py-3 md:py-3.5 border border-gray-200 focus:border-emerald-500 focus:outline-hidden transition-all shadow-2xs"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-1.5 md:right-2 p-2 md:p-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-full transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
              aria-label="Kirim"
            >
              <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </form>
          <p className="text-[10px] text-gray-400 text-center mt-1.5 truncate px-2">
            AI merangkum modul PLH. Cross-check dengan buku sekolahmu.
          </p>
        </div>
      </main>

      {/* Modal Upload Dataset */}
      <DatasetUploaderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
