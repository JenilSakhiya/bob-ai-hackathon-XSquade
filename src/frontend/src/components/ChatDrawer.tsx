import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, X, CornerDownLeft, ShieldCheck } from 'lucide-react';
import { ChatMessage } from '../types';
import { api } from '../services/api';

interface Props {
  incidentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_QUESTIONS = [
  'Why is this incident critical?',
  'What happened first in the timeline?',
  'Which user and host are affected?',
  'What evidence suggests account takeover?',
  'What response action should be taken first?',
  'Generate an executive summary for CISO.',
];

export const ChatDrawer: React.FC<Props> = ({ incidentId, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history when drawer opens
  useEffect(() => {
    if (isOpen && incidentId) {
      loadHistory();
    }
  }, [isOpen, incidentId]);

  const loadHistory = async () => {
    try {
      const history = await api.getChatHistory(incidentId);
      if (history.length === 0) {
        setMessages([
          {
            id: 0,
            incident_id: incidentId,
            role: 'assistant',
            content: `CyberSentinel Analyst is ready for incident ${incidentId}. Ask any question regarding correlated telemetry, event timeline, or prescriptive response playbooks.`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages(history);
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    setInputValue('');
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      incident_id: incidentId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage(incidentId, text);
      setMessages(res.history);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          incident_id: incidentId,
          role: 'assistant',
          content: `Error communicating with AI engine: ${err.message || 'Service unreachable'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-white/[0.08] bg-[#090d16] shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0f1623] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-950/60 border border-sky-800/50 text-sky-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              SOC AI Analyst
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded">
                <ShieldCheck className="h-2.5 w-2.5" /> Grounded
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Evidence-constrained investigation assistant
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Suggested Inquiries */}
      <div className="border-b border-white/[0.08] bg-[#0c121e] px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5 font-medium">
          <Sparkles className="h-3 w-3 text-sky-400" />
          Suggested Questions:
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="shrink-0 rounded-md border border-white/[0.08] bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:border-sky-500/50 hover:text-sky-300 hover:bg-slate-850 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 border border-slate-700 text-sky-400">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-[#111827] border border-white/[0.08] text-slate-200 whitespace-pre-wrap font-normal'
                }`}
              >
                {m.content}
              </div>

              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-950 border border-sky-800 text-sky-300">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 border border-slate-700 text-sky-400">
              <Bot className="h-3.5 w-3.5 animate-spin" />
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#111827] p-3 text-xs text-slate-400 flex items-center gap-2">
              <div className="flex space-x-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400 [animation-delay:0.2s]"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400 [animation-delay:0.4s]"></span>
              </div>
              <span className="text-[11px]">Analyzing telemetry evidence...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="border-t border-white/[0.08] bg-[#0f1623] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question about this incident's telemetry..."
              disabled={loading}
              className="w-full rounded-lg border border-white/[0.1] bg-[#090d16] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white hover:bg-sky-500 transition-colors disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
        <p className="mt-1.5 text-[10px] text-slate-500 text-right flex items-center justify-end gap-1">
          <CornerDownLeft className="h-2.5 w-2.5" /> Press Enter to send
        </p>
      </div>
    </div>
  );
};
