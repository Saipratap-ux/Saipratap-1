import React from 'react';
import { QuickPrompt } from '../types';

interface QuickPromptsProps {
  prompts: QuickPrompt[];
  onSelectPrompt: (query: string) => void;
  disabled?: boolean;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({
  prompts,
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto my-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Suggested Voice Questions
        </span>
        <span className="text-[11px] text-slate-500">
          Tap any topic to ask
        </span>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {prompts.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(p.query)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/70 hover:bg-slate-700/80 hover:text-white border border-slate-700/60 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap"
          >
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
