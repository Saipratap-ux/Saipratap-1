import React from 'react';
import { Mic, Square, Loader2, Volume2, AlertCircle, RefreshCw } from 'lucide-react';
import { AgentState } from '../types';

interface CentralMicButtonProps {
  state: AgentState;
  onToggle: () => void;
  onInterrupt: () => void;
  audioLevel: number;
}

export const CentralMicButton: React.FC<CentralMicButtonProps> = ({
  state,
  onToggle,
  onInterrupt,
  audioLevel,
}) => {
  // Determine state copy & visual classes
  const getStateMeta = () => {
    switch (state) {
      case 'listening':
        return {
          label: 'Listening',
          subLabel: 'Speak clearly into your microphone · Click to finish',
          btnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/40',
          ringColor: 'border-amber-400/40',
          pulseColor: 'bg-amber-400/20',
        };
      case 'processing':
        return {
          label: 'Processing',
          subLabel: 'Chandrakanti is formulating your answer...',
          btnBg: 'bg-purple-600 text-white shadow-purple-600/40 cursor-wait',
          ringColor: 'border-purple-500/40',
          pulseColor: 'bg-purple-500/20',
        };
      case 'speaking':
        return {
          label: 'Speaking',
          subLabel: 'Voice playing · Click mic or stop to interrupt (barge-in)',
          btnBg: 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/40',
          ringColor: 'border-teal-400/40',
          pulseColor: 'bg-teal-400/20',
        };
      case 'connecting':
        return {
          label: 'Connecting Mic',
          subLabel: 'Requesting microphone access...',
          btnBg: 'bg-indigo-600 text-white shadow-indigo-600/30',
          ringColor: 'border-indigo-400/40',
          pulseColor: 'bg-indigo-500/20',
        };
      case 'interrupted':
        return {
          label: 'Interrupted',
          subLabel: 'Speech halted instantly',
          btnBg: 'bg-rose-500 text-white shadow-rose-500/30',
          ringColor: 'border-rose-400/40',
          pulseColor: 'bg-rose-400/20',
        };
      case 'error':
        return {
          label: 'Attention Needed',
          subLabel: 'Microphone or network issue detected · See recovery below',
          btnBg: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
          ringColor: 'border-rose-500/40',
          pulseColor: 'bg-rose-500/20',
        };
      case 'completed':
        return {
          label: 'Completed',
          subLabel: 'Turn finished · Click to speak again',
          btnBg: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30',
          ringColor: 'border-cyan-500/40',
          pulseColor: 'bg-cyan-500/20',
        };
      case 'idle':
      default:
        return {
          label: 'Ready to Listen',
          subLabel: 'Tap to start two-way voice conversation',
          btnBg: 'bg-gradient-to-tr from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/25',
          ringColor: 'border-cyan-500/20',
          pulseColor: 'bg-cyan-500/10',
        };
    }
  };

  const meta = getStateMeta();
  const isActive = state === 'listening' || state === 'speaking' || state === 'processing';
  const canInterrupt = state === 'speaking' || state === 'processing' || state === 'listening';

  return (
    <div className="flex flex-col items-center justify-center text-center my-2 select-none">
      {/* Outer interactive cluster */}
      <div className="relative flex items-center justify-center p-6">
        {/* Animated aura rings */}
        <div
          className={`absolute rounded-full border transition-all duration-500 pointer-events-none ${
            meta.ringColor
          } ${isActive ? 'scale-125 opacity-100' : 'scale-100 opacity-40'}`}
          style={{
            width: `${170 + audioLevel * 70}px`,
            height: `${170 + audioLevel * 70}px`,
          }}
        />

        <div
          className={`absolute rounded-full transition-all duration-700 pointer-events-none ${
            meta.pulseColor
          } ${
            state === 'listening'
              ? 'animate-ping opacity-35 duration-1000'
              : state === 'speaking'
              ? 'animate-pulse opacity-40'
              : 'opacity-0'
          }`}
          style={{
            width: `${130 + audioLevel * 50}px`,
            height: `${130 + audioLevel * 50}px`,
          }}
        />

        {/* Main Central Microphone Button */}
        <button
          type="button"
          onClick={onToggle}
          aria-label={
            state === 'listening'
              ? 'Stop listening'
              : state === 'speaking'
              ? 'Interrupt AI speech'
              : 'Start listening'
          }
          className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400 ${meta.btnBg}`}
        >
          {state === 'connecting' && <Loader2 className="w-10 h-10 animate-spin" />}
          {state === 'processing' && <Loader2 className="w-10 h-10 animate-spin" />}
          {state === 'listening' && (
            <div className="relative flex items-center justify-center">
              <Mic className="w-10 h-10 sm:w-11 sm:h-11 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            </div>
          )}
          {state === 'speaking' && (
            <div className="flex items-center justify-center">
              <Volume2 className="w-10 h-10 sm:w-11 sm:h-11 animate-bounce" />
            </div>
          )}
          {state === 'interrupted' && <Square className="w-9 h-9 fill-current" />}
          {state === 'error' && <AlertCircle className="w-10 h-10" />}
          {state === 'completed' && <RefreshCw className="w-9 h-9" />}
          {state === 'idle' && <Mic className="w-10 h-10 sm:w-11 sm:h-11" />}
        </button>

        {/* Dedicated Manual Stop / Interrupt Button (Barge-In) */}
        {canInterrupt && (
          <button
            type="button"
            onClick={onInterrupt}
            title="Interrupt / Stop AI Speech (Barge-In)"
            className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-rose-950/80 text-rose-300 hover:text-rose-200 border border-rose-500/40 rounded-xl shadow-lg transition-all active:scale-95 text-xs font-semibold"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
        )}
      </div>

      {/* State & Contextual Guidance Text */}
      <div className="mt-1 flex flex-col items-center">
        <div className="flex items-center gap-2">
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
                : 'bg-cyan-400'
            }`}
          />
          <h2 className="text-base sm:text-lg font-semibold tracking-wide text-slate-100">
            {meta.label}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1">
          {meta.subLabel}
        </p>
      </div>
    </div>
  );
};
