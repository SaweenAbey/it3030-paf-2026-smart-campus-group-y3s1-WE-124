import { useEffect, useMemo, useState } from 'react';

import { chatbotAPI } from '../services/api';

const nowLabel = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hi, I am UNI 360 Chat Bot. Ask me about all resources, booking details, or available time slots.',
      time: nowLabel(),
    },
  ]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const loadHelp = async () => {
      try {
        const response = await chatbotAPI.getHelp();
        const nextSuggestions = response.data?.suggestions;
        if (Array.isArray(nextSuggestions)) {
          setSuggestions(nextSuggestions);
        }
      } catch (error) {
        console.error('Failed to load chatbot help:', error);
      }
    };

    loadHelp();
  }, []);

  const canSend = useMemo(() => question.trim().length > 0 && !loading, [question, loading]);

  const askBot = async (text) => {
    const finalQuestion = text.trim();
    if (!finalQuestion || loading) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: finalQuestion, time: nowLabel() },
    ]);
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
        {
          role: 'bot',
          text: `Error: ${message}`,
          time: nowLabel(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    askBot(question);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_100%_0%,#cffafe,transparent_35%),radial-gradient(circle_at_0%_100%,#dbeafe,transparent_35%),#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_40px_80px_-55px_rgba(14,116,144,0.45)]">
          <div className="bg-linear-to-r from-slate-900 via-sky-900 to-cyan-900 px-6 py-6 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">UNI 360 Assistant</p>
            <h1 className="mt-2 text-3xl font-black text-white">Campus Chat Bot</h1>
            <p className="mt-2 text-sm text-cyan-100">
              Ask questions and get instant answers about resources, bookings, and available time slots.
            </p>
          </div>

          <div className="flex h-[65vh] min-h-130 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto bg-linear-to-b from-slate-50 to-white p-5 sm:p-6">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <article
                    className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-linear-to-r from-sky-700 to-cyan-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
                    <p
                      className={`mt-2 text-[11px] font-medium ${
                        message.role === 'user' ? 'text-cyan-100' : 'text-slate-400'
                      }`}
                    >
                      {message.time}
                    </p>
                  </article>
                </div>
              ))}

              {loading ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    Thinking...
                  </div>
                </div>
              ) : null}
            </div>

            {suggestions.length > 0 ? (
              <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 sm:px-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick Questions</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => askBot(item)}
                      className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-50"
                      disabled={loading}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask: Show all resources | My booking details | Available slots for Library tomorrow"
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="h-12 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChatbotPage;
