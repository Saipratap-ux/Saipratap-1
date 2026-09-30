import React from 'react';
import { X, Sliders, Volume2, Mic, Activity, ShieldCheck, Cpu } from 'lucide-react';
import { VoiceSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: VoiceSettings) => void;
  availableVoices: SpeechSynthesisVoice[];
  audioDevices: MediaDeviceInfo[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  availableVoices,
  audioDevices,
}) => {
  if (!isOpen) return null;

  const handleChange = <K extends keyof VoiceSettings>(key: K, value: VoiceSettings[K]) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Voice & Agent Settings</h3>
              <p className="text-xs text-slate-400">Configure speech engines, voices, and audio behaviors</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* TTS Engine */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              Text-To-Speech Synthesis Engine
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange('ttsEngine', 'gemini')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  settings.ttsEngine === 'gemini'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="font-semibold text-xs text-slate-200 flex items-center justify-between">
                  <span>Gemini Neural Voice</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Recommended</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  High-fidelity 24kHz conversational AI voice generated via Gemini Audio
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleChange('ttsEngine', 'browser')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  settings.ttsEngine === 'browser'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="font-semibold text-xs text-slate-200">
                  Browser Web Speech
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Local device text-to-speech with zero network latency
                </p>
              </button>
            </div>
          </div>

          {/* Gemini Prebuilt Voice Persona */}
          {settings.ttsEngine === 'gemini' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">
                Gemini Voice Persona
              </label>
              <select
                value={settings.geminiVoice}
                onChange={(e) => handleChange('geminiVoice', e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Kore">Kore (Warm, articulate & friendly - Default)</option>
                <option value="Zephyr">Zephyr (Calm, thoughtful & balanced)</option>
                <option value="Fenrir">Fenrir (Resonant, deep & expressive)</option>
                <option value="Puck">Puck (Bright, energetic & lively)</option>
                <option value="Charon">Charon (Authoritative & informative)</option>
              </select>
            </div>
          )}

          {/* Browser Voice Picker */}
          {settings.ttsEngine === 'browser' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">
                Local Device Voice
              </label>
              <select
                value={settings.browserVoiceURI}
                onChange={(e) => handleChange('browserVoiceURI', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Auto Detect for Language</option>
                {availableVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Speaking Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Speech Rate</span>
              <span className="font-mono text-cyan-400">{settings.speakingRate}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={settings.speakingRate}
              onChange={(e) => handleChange('speakingRate', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.75x (Slower)</span>
              <span>1.0x (Normal)</span>
              <span>1.5x (Faster)</span>
            </div>
          </div>

          {/* Continuous Conversation Mode Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-xl">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-slate-200">
                Continuous Conversation (Hands-Free)
              </div>
              <div className="text-[11px] text-slate-400">
                Automatically listen for your next question after Chandrakanti finishes speaking
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.continuousMode}
                onChange={(e) => handleChange('continuousMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {/* Visualizer Mode */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <Activity className="w-4 h-4 text-cyan-400" />
              Visualizer Waveform Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['wave', 'radial', 'frequency'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleChange('visualizerMode', m)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border capitalize transition-all ${
                    settings.visualizerMode === m
                      ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 font-semibold'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m === 'wave' ? 'Harmonic Wave' : m === 'radial' ? 'Orbital Radial' : 'Spectrum Bars'}
                </button>
              ))}
            </div>
          </div>

          {/* Microphone device selector */}
          {audioDevices.length > 1 && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                Input Microphone Device
              </label>
              <select
                value={settings.micDeviceId}
                onChange={(e) => handleChange('micDeviceId', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Default Microphone</option>
                {audioDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Privacy & Developer Info */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-1.5 text-slate-400">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Voice Processing</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Your voice is captured strictly for live transcription and conversation turn processing. Audio is never persistently recorded or used for advertising.
            </p>
            <div className="pt-1 text-[11px] text-cyan-400/90 font-medium">
              Chandrakanti AI Voice Agent · Engineered by Saipratap Developer
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
