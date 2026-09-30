import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Copy, Check, Download, Trash2, Sparkles, User } from 'lucide-react';
import { Message, AgentState } from '../types';

interface TranscriptPanelProps {
  messages: Message[];
  interimTranscript: string;
  state: AgentState;
  onReplay: (text: string, id: string) => void;
  onClear: () => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  messages,
  interimTranscript,
  state,
  onReplay,
  onClear,
}) => {
  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = (format: 'txt' | 'json') => {
    let content = '';
    let filename = `chandrakanti_transcript_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'json') {
      content = JSON.stringify(messages, null, 2);
      filename += '.json';
    } else {
      content = messages
        .map(
          (m) =>
            `[${new Date(m.timestamp).toLocaleTimeString()}] ${
              m.role === 'assistant' ? 'Chandrakanti' : 'User'
            }:\n${m.content}\n`
        )
        .join('\n');
      filename += '.txt';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Conversation Transcript
          </span>
          <span className="text-xs text-slate-500 font-mono">
            ({messages.length})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleExport('txt')}
            title="Export conversation as text"
            className="p-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            title="Clear transcript history"
            className="p-1.5 text-xs text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scroll-smooth">
        {messages.map((message) => {
          const isAssistant = message.role === 'assistant';
          return (
            <div
              key={message.id}
              className={`flex flex-col ${
                isAssistant ? 'items-start' : 'items-end'
              }`}
            >
              {/* Quiet unboxed metadata line */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 px-1">
                {isAssistant ? (
                  <span className="flex items-center gap-1 text-cyan-400 font-medium">
                    <Sparkles className="w-3 h-3" />
                    Chandrakanti
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-indigo-400 font-medium">
                    <User className="w-3 h-3" />
                    You
                  </span>
                )}
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px]">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 leading-relaxed transition-all ${
                  isAssistant
                    ? 'bg-slate-800/80 text-slate-100 border border-slate-700/60 rounded-tl-sm'
                    : 'bg-indigo-600/90 text-white rounded-tr-sm shadow-md'
                }`}
              >
                <p className="whitespace-pre-wrap font-sans text-sm sm:text-[15px] break-words">
                  {message.content}
                </p>

                {/* Bubble action toolbar */}
                <div
                  className={`mt-2 pt-2 border-t flex items-center gap-3 text-xs ${
                    isAssistant
                      ? 'border-slate-700/50 text-slate-400'
                      : 'border-indigo-500/40 text-indigo-200'
                  }`}
                >
                  {isAssistant && (
                    <button
                      type="button"
                      onClick={() => onReplay(message.content, message.id)}
                      title="Listen again"
                      className="hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Replay</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopy(message.content, message.id)}
                    title="Copy text"
                    className="hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Real-time live interim transcription display */}
        {state === 'listening' && interimTranscript && (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-xs text-amber-400 mb-1 px-1">
              <span className="animate-pulse">● Live listening...</span>
            </div>
            <div className="max-w-[88%] sm:max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-200 italic shadow-inner">
              <p className="text-sm sm:text-[15px] break-words">
                {interimTranscript}
                <span className="inline-block w-1.5 h-4 ml-1 bg-amber-400 animate-pulse align-middle" />
              </p>
            </div>
          </div>
        )}

        {/* Processing status pulse */}
        {state === 'processing' && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 text-xs text-purple-400 mb-1 px-1">
              <span>Chandrakanti is thinking...</span>
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-slate-800/80 border border-purple-500/30 text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
              <span
                className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
              <span className="text-xs ml-1 text-slate-300">Formulating response</span>
            </div>
          </div>
        )}

        <div ref={scrollEndRef} />
      </div>
    </div>
  );
};
