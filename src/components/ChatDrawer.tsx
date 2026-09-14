import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, X, MessageSquare, Terminal } from 'lucide-react';
import { ChatMessage } from '../types';
import { api } from '../services/api';

interface Props {
  incidentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_QUESTIONS = [
  'Why is this incident critical?',
  'What happened first?',
  'Which user is affected?',
  'What evidence suggests account takeover?',
  'What should the security team do first?',
  'Summarize this incident for management.',
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
        // Initial friendly greeting from CyberSentinel
        setMessages([
          {
            id: 0,
            incident_id: incidentId,
            role: 'assistant',
            content: `CyberSentinel AI Analyst online for incident ${incidentId}. Ask any question regarding correlated telemetry, evidence, timeline, or response strategies.`,
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
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-700/80 bg-[#070a12] shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0d1322] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              CyberSentinel AI SOC Analyst
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Incident Grounded • Zero Hallucination Mode
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="border-b border-slate-800/80 bg-[#090d18] px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-1.5">
          <Sparkles className="h-3 w-3 text-cyan-400" />
          Recommended Inquiries:
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="shrink-0 rounded-full border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-[11px] font-mono text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-md'
                    : 'bg-[#0d1322] border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap font-sans'
                }`}
              >
                {m.content}
              </div>

              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400 text-xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Bot className="h-4 w-4 animate-pulse" />
            </div>
            <div className="rounded-2xl rounded-tl-none border border-slate-800 bg-[#0d1322] p-3 text-xs text-slate-400 flex items-center gap-2">
              <div className="flex space-x-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:0.2s]"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:0.4s]"></span>
              </div>
              <span className="font-mono text-[11px]">CyberSentinel analyzing incident telemetry...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="border-t border-slate-800 bg-[#0d1322] p-4">
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
              placeholder="Ask about this incident's telemetry or evidence..."
              disabled={loading}
              className="w-full rounded-xl border border-slate-700/80 bg-[#090d18] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-40 disabled:hover:bg-cyan-500"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
