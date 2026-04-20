import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { chatbotAPI } from '../services/api';

const nowLabel = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const initialBotMessage = () => ({
  role: 'bot',
  text: 'Hello. I can answer questions about all resources, booking details, and available time slots.',
  time: nowLabel(),
});

const ChatbotFloatingButton = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialBotMessage()]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [chatStartedAt, setChatStartedAt] = useState(new Date());
  const listRef = useRef(null);

  useEffect(() => {
    const loadHelp = async () => {
      if (!isAuthenticated()) {
        return;
      }

      try {
        const response = await chatbotAPI.getHelp();
        if (Array.isArray(response.data?.suggestions)) {
          setSuggestions(response.data.suggestions);
        }
      } catch (error) {
        console.error('Failed to load chatbot suggestions:', error);
      }
    };

    loadHelp();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading, isOpen]);

  const canSend = useMemo(() => question.trim().length > 0 && !loading, [question, loading]);

  const askBot = async (text) => {
    const finalQuestion = text.trim();
    if (!finalQuestion || loading) return;

    if (!isAuthenticated()) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: finalQuestion, time: nowLabel() },
        {
          role: 'bot',
          text: 'Please sign in first to use chatbot data features. I can then access your booking details securely.',
          time: nowLabel(),
        },
      ]);
      setQuestion('');
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', text: finalQuestion, time: nowLabel() }]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await chatbotAPI.ask(finalQuestion);
      const data = response.data;
      const answerText = [
        data?.answer,
        data?.followUpQuestion ? `\n\n${data.followUpQuestion}` : '',
      ]
        .filter(Boolean)
        .join('');

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: answerText || 'I could not process that right now. Please try again.',
          time: nowLabel(),
        },
      ]);

      if (Array.isArray(data?.suggestions)) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to contact chatbot service.';
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: `Error: ${message}`, time: nowLabel() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    askBot(question);
  };

  const handleNewChat = () => {
    setMessages([initialBotMessage()]);
    setQuestion('');
    setChatStartedAt(new Date());
  };

  const handleClearChat = () => {
    setMessages([]);
    setQuestion('');
  };

  return (
    <>
      {isOpen ? (
        <section className="fixed bottom-24 right-4 z-[75] flex h-[68vh] min-h-[500px] w-[min(860px,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_30px_90px_-45px_rgba(14,116,144,0.65)]">
          <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-linear-to-b from-slate-900 via-slate-900 to-sky-950 p-4 text-slate-100 md:flex md:flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-200">UNI 360</p>
            <h2 className="mt-2 text-lg font-black">Chat Control</h2>
            <p className="mt-1 text-xs text-cyan-100/90">
              Started {chatStartedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleNewChat}
                className="w-full rounded-xl border border-cyan-200/30 bg-cyan-400/20 px-3 py-2 text-left text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/30"
              >
                + New Chat
              </button>
              <button
                type="button"
                onClick={handleClearChat}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-left text-sm font-semibold text-slate-100 transition hover:bg-white/20"
              >
                Clear Chat
              </button>
            </div>

            <div className="mt-5 border-t border-white/15 pt-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200">Quick Ask</p>
              <div className="space-y-1.5">
                {suggestions.slice(0, 3).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => askBot(item)}
                    className="w-full rounded-lg bg-white/10 px-2.5 py-1.5 text-left text-xs font-medium text-slate-100 transition hover:bg-white/20"
                    disabled={loading}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="bg-linear-to-r from-slate-900 via-sky-900 to-cyan-900 px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-200">UNI 360 Assistant</p>
              <h2 className="mt-1 text-lg font-black text-white">Campus Chat Bot</h2>
              <p className="mt-1 text-xs text-cyan-100">Ask resources, booking details, and available slot questions.</p>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-linear-to-b from-slate-50 to-white p-4">
              {messages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  Chat cleared. Start a new conversation.
                </div>
              ) : null}

              {messages.map((message, idx) => (
                <div key={`${message.role}-${idx}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <article
                    className={`max-w-[90%] rounded-2xl px-3.5 py-3 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-linear-to-r from-sky-700 to-cyan-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
                    <p className={`mt-1.5 text-[10px] font-medium ${message.role === 'user' ? 'text-cyan-100' : 'text-slate-400'}`}>
                      {message.time}
                    </p>
                  </article>
                </div>
              ))}

              {loading ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-500 shadow-sm">
                    Thinking...
                  </div>
                </div>
              ) : null}
            </div>

            {suggestions.length > 0 ? (
              <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 md:hidden">
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.slice(0, 3).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => askBot(item)}
                      className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-50"
                      disabled={loading}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                </button>
              </div>

              {!isAuthenticated() ? (
                <p className="mt-2 text-[11px] text-slate-500">
                  Need full chatbot answers?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-semibold text-sky-700 hover:text-sky-800"
                  >
                    Sign in
                  </button>
                </p>
              ) : null}
            </form>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close Chat Bot' : 'Open Chat Bot'}
        title={isOpen ? 'Close Chat Bot' : 'Open Chat Bot'}
        className={`fixed bottom-6 right-6 z-[80] flex h-14 w-14 items-center justify-center rounded-full border shadow-[0_18px_40px_-18px_rgba(14,116,144,0.75)] transition-all duration-300 hover:scale-105 ${
          isOpen
            ? 'border-cyan-200 bg-linear-to-br from-cyan-500 to-sky-600 text-white'
            : 'border-white/50 bg-linear-to-br from-slate-900 to-sky-700 text-cyan-100 hover:from-slate-800 hover:to-sky-600'
        }`}
      >
        {isOpen ? (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5m-7 6 3.4-2a2 2 0 0 1 1.1-.3H18a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3z" />
          </svg>
        )}
      </button>
    </>
  );
};

export default ChatbotFloatingButton;
