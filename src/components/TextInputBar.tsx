import React, { useState } from 'react';
import { Send, Mic, Sparkles } from 'lucide-react';
import { AgentState } from '../types';

interface TextInputBarProps {
  onSend: (text: string) => void;
  onMicClick: () => void;
  state: AgentState;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const TextInputBar: React.FC<TextInputBarProps> = ({
  onSend,
  onMicClick,
  state,
  inputRef,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || state === 'processing') return;
    onSend(text.trim());
    setText('');
  };

  const isBusy = state === 'processing';

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center w-full max-w-2xl mx-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl backdrop-blur-md transition-all focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20"
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message or question in any Indian language or English..."
        disabled={isBusy}
        className="flex-1 bg-transparent px-4 py-3.5 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-60"
      />

      <div className="flex items-center gap-1.5 pr-2">
        <button
          type="button"
          onClick={onMicClick}
          title={state === 'listening' ? 'Finish speaking' : 'Speak with microphone'}
          className={`p-2 rounded-xl transition-all ${
            state === 'listening'
              ? 'bg-amber-500 text-slate-950 animate-pulse'
              : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
          }`}
        >
          <Mic className="w-5 h-5" />
        </button>

        <button
          type="submit"
          disabled={!text.trim() || isBusy}
          title="Send message"
          className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white disabled:text-slate-500 rounded-xl transition-all shadow-md active:scale-95 disabled:pointer-events-none"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
