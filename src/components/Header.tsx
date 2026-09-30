import React from 'react';
import { Globe, Settings, Sparkles } from 'lucide-react';
import { LanguageOption } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

interface HeaderProps {
  currentLanguage: LanguageOption;
  onSelectLanguage: (lang: LanguageOption) => void;
  onOpenSettings: () => void;
  state: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onSelectLanguage,
  onOpenSettings,
  state,
}) => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single-element Brand Title */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 shrink-0">
            <img
              src="/src/assets/images/chandrakanti_avatar_1790779114877.jpg"
              alt="Chandrakanti AI"
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback icon container if image fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 -z-10">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white font-serif">
                Chandrakanti
              </span>
              <span className="hidden sm:inline text-[11px] text-slate-400">
                by Saipratap Developer
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 sm:hidden">
              <span>by Saipratap Developer</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links / State Indicator */}
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                state === 'listening'
                  ? 'bg-amber-400 animate-ping'
                  : state === 'speaking'
                  ? 'bg-teal-400 animate-pulse'
                  : state === 'processing'
                  ? 'bg-purple-400 animate-spin'
                  : state === 'error'
                  ? 'bg-rose-500'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="capitalize">{state}</span>
          </span>
          <span className="text-slate-600">·</span>
          <span>Two-Way Voice</span>
          <span className="text-slate-600">·</span>
          <span>Barge-in Enabled</span>
          <span className="text-slate-600">·</span>
          <span>Indian Languages</span>
        </div>

        {/* Zone 3: Primary Actions (Language Dropdown & Settings) */}
        <div className="flex items-center gap-2.5">
          {/* Language Selector */}
          <div className="relative flex items-center">
            <Globe className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={currentLanguage.code}
              onChange={(e) => {
                const selected = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
                if (selected) onSelectLanguage(selected);
              }}
              aria-label="Select spoken language"
              className="pl-8 pr-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer appearance-none max-w-[140px] sm:max-w-[170px] truncate"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.nativeLabel} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Configure voice & agent settings"
            className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
