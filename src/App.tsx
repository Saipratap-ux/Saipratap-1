import React, { useState, useRef } from 'react';
import { useVoiceAgent } from './hooks/useVoiceAgent';
import { Header } from './components/Header';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { CentralMicButton } from './components/CentralMicButton';
import { TranscriptPanel } from './components/TranscriptPanel';
import { QuickPrompts } from './components/QuickPrompts';
import { TextInputBar } from './components/TextInputBar';
import { ErrorNotice } from './components/ErrorNotice';
import { SettingsModal } from './components/SettingsModal';
import { getQuickPromptsForLang } from './utils/languages';
import { MessageSquare, Mic, Sparkles } from 'lucide-react';

export default function App() {
  const {
    state,
    messages,
    currentLanguage,
    settings,
    interimTranscript,
    errorInfo,
    audioLevel,
    analyserRef,
    availableVoices,
    audioDevices,
    setSettings,
    changeLanguage,
    toggleListening,
    startListening,
    interruptPlayback,
    sendTextMessage,
    replayMessage,
    clearHistory,
    setErrorInfo,
  } = useVoiceAgent('en-IN');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'voice' | 'transcript'>('voice');
  const textInputRef = useRef<HTMLInputElement | null>(null);

  const quickPrompts = getQuickPromptsForLang(currentLanguage.code);

  const handleSelectQuickPrompt = (promptQuery: string) => {
    sendTextMessage(promptQuery);
  };

  const handleSwitchToText = () => {
    setErrorInfo(null);
    textInputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top 3-zone Header */}
      <Header
        currentLanguage={currentLanguage}
        onSelectLanguage={changeLanguage}
        onOpenSettings={() => setIsSettingsOpen(true)}
        state={state}
      />

      {/* Mobile Segmented View Switcher */}
      <div className="lg:hidden flex items-center justify-center p-2 bg-slate-900/60 border-b border-slate-800">
        <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <button
            type="button"
            onClick={() => setMobileTab('voice')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              mobileTab === 'voice'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Agent</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('transcript')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              mobileTab === 'transcript'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Transcript ({messages.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left / Primary: Voice Interaction Arena */}
        <section
          className={`lg:col-span-7 flex flex-col justify-between bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 sm:p-8 backdrop-blur-xl relative overflow-hidden ${
            mobileTab === 'transcript' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Subtle celestial moonlight ambient glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Arena Top Info */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-cyan-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chandrakanti AI</span>
              </span>
              <span>·</span>
              <span>{currentLanguage.nativeLabel} Mode</span>
            </div>

            <span className="hidden sm:inline text-slate-500 font-mono text-[11px]">
              Continuous: {settings.continuousMode ? 'On' : 'Off'} · Engine: {settings.ttsEngine === 'gemini' ? 'Gemini Neural' : 'Web Speech'}
            </span>
          </div>

          {/* Central Voice Engine Stage */}
          <div className="relative z-10 my-auto py-4 flex flex-col items-center justify-center">
            {/* Real-time Frequency / Wave Visualizer */}
            <VoiceVisualizer
              state={state}
              analyserRef={analyserRef}
              mode={settings.visualizerMode}
              audioLevel={audioLevel}
            />

            {/* Central Mic Button with Barge-In Stop */}
            <CentralMicButton
              state={state}
              onToggle={toggleListening}
              onInterrupt={interruptPlayback}
              audioLevel={audioLevel}
            />

            {/* Error Notice Card with Troubleshooting Actions */}
            {errorInfo && (
              <ErrorNotice
                error={errorInfo}
                onRetry={startListening}
                onDismiss={() => setErrorInfo(null)}
                onSwitchToText={handleSwitchToText}
              />
            )}

            {/* Suggested Quick Questions */}
            <QuickPrompts
              prompts={quickPrompts}
              onSelectPrompt={handleSelectQuickPrompt}
              disabled={state === 'processing'}
            />
          </div>

          {/* Arena Bottom Guidance Bar */}
          <div className="relative z-10 pt-3 border-t border-slate-800/60 text-center sm:flex sm:items-center sm:justify-between text-xs text-slate-500">
            <span>Natural Indian language voice engine with instant barge-in support</span>
            <span className="mt-1 sm:mt-0 font-medium text-slate-400">
              Developed by Saipratap Developer
            </span>
          </div>
        </section>

        {/* Right / Secondary: Synchronized Conversation Transcript */}
        <section
          className={`lg:col-span-5 flex flex-col h-[520px] lg:h-auto ${
            mobileTab === 'voice' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <TranscriptPanel
            messages={messages}
            interimTranscript={interimTranscript}
            state={state}
            onReplay={replayMessage}
            onClear={clearHistory}
          />
        </section>
      </main>

      {/* Floating Bottom Action & Text Fallback Bar */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl p-4 sticky bottom-0 z-30">
        <TextInputBar
          inputRef={textInputRef}
          onSend={sendTextMessage}
          onMicClick={toggleListening}
          state={state}
        />
      </footer>

      {/* Voice & Agent Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        availableVoices={availableVoices}
        audioDevices={audioDevices}
      />
    </div>
  );
}
