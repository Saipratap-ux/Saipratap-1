import { useState, useEffect, useRef, useCallback } from 'react';
import { AgentState, Message, VoiceSettings, ErrorInfo, LanguageOption } from '../types';
import { getLanguageByCode } from '../utils/languages';

const DEFAULT_SETTINGS: VoiceSettings = {
  ttsEngine: 'gemini',
  geminiVoice: 'Kore',
  browserVoiceURI: '',
  speakingRate: 1.0,
  pitch: 1.0,
  sttEngine: 'webspeech',
  continuousMode: false,
  micDeviceId: '',
  visualizerMode: 'wave',
  autoPlayVoice: true,
};

export function useVoiceAgent(initialLangCode: string = 'en-IN') {
  const [state, setState] = useState<AgentState>('idle');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: getLanguageByCode(initialLangCode).greeting,
      timestamp: Date.now(),
      language: initialLangCode,
      status: 'success',
    },
  ]);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>(
    getLanguageByCode(initialLangCode)
  );
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [isMicAvailable, setIsMicAvailable] = useState<boolean>(true);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);

  // Audio & Hardware Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isStoppingRef = useRef<boolean>(false);
  const stateRef = useRef<AgentState>(state);
  stateRef.current = state;
  const settingsRef = useRef<VoiceSettings>(settings);
  settingsRef.current = settings;
  const currentLanguageRef = useRef<LanguageOption>(currentLanguage);
  currentLanguageRef.current = currentLanguage;

  // Initialize SpeechSynthesis Voices and enumerate mic devices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    // Enumerate devices
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const mics = devices.filter((d) => d.kind === 'audioinput');
          setAudioDevices(mics);
        })
        .catch((err) => {
          console.warn('Failed to enumerate audio devices:', err);
        });
    }

    return () => {
      stopAllAudio();
      cleanupAudioContext();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Update welcome message if language changed and conversation is fresh
  const changeLanguage = useCallback((lang: LanguageOption) => {
    setCurrentLanguage(lang);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = lang.code;
      } catch (e) {
        console.warn('Could not update recognition language immediately', e);
      }
    }
  }, []);

  // Initialize Audio Context & Analyser
  const setupAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (err) {
        console.warn('AudioContext resume error:', err);
      }
    }

    if (audioContextRef.current && !analyserRef.current) {
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
    }

    return {
      audioCtx: audioContextRef.current,
      analyser: analyserRef.current,
    };
  }, []);

  const cleanupAudioContext = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
  }, []);

  // Stop active speech synthesis or audio element playback
  const stopAllAudio = useCallback(() => {
    if (currentAudioElementRef.current) {
      currentAudioElementRef.current.pause();
      currentAudioElementRef.current.currentTime = 0;
      currentAudioElementRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    currentUtteranceRef.current = null;
  }, []);

  // Monitor live audio level for visualizer & voice activity
  const startAudioLevelMonitoring = useCallback((sourceNode: AudioNode) => {
    if (!analyserRef.current) return;
    try {
      sourceNode.connect(analyserRef.current);
    } catch (e) {
      console.warn('Analyser connect note:', e);
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const checkLevel = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const normalized = Math.min(1, avg / 128);
      setAudioLevel(normalized);

      // Barge-in check: If AI is currently speaking and user speaks loudly into mic
      if (stateRef.current === 'speaking' && normalized > 0.35) {
        interruptPlayback();
      }

      animationFrameRef.current = requestAnimationFrame(checkLevel);
    };

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(checkLevel);
  }, []);

  // Stop monitoring audio level
  const stopAudioLevelMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Interrupt playback (barge-in or manual Stop button)
  const interruptPlayback = useCallback(() => {
    stopAllAudio();
    stopAudioLevelMonitoring();

    if (stateRef.current === 'speaking' || stateRef.current === 'processing') {
      setState('interrupted');
      setTimeout(() => {
        setState('idle');
      }, 700);
    } else if (stateRef.current === 'listening') {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
      setState('interrupted');
      setTimeout(() => {
        setState('idle');
      }, 500);
    }
  }, [stopAllAudio, stopAudioLevelMonitoring]);

  // Handle Speech Output (TTS) with Gemini or Browser fallback
  const speakResponse = useCallback(
    async (text: string, messageId: string) => {
      setState('speaking');
      stopAllAudio();

      const { audioCtx, analyser } = await setupAudioContext();

      // Mode A: Gemini Neural Voice (via /api/tts)
      if (settingsRef.current.ttsEngine === 'gemini') {
        try {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              voiceName: settingsRef.current.geminiVoice,
              speechStyle: 'Warm, natural, clear and articulate voice assistant',
            }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `TTS Server error ${res.status}`);
          }

          const data = await res.json();
          if (data.audioBase64) {
            const audioUri = `data:audio/wav;base64,${data.audioBase64}`;
            const audio = new Audio(audioUri);
            currentAudioElementRef.current = audio;

            // Connect audio element to AudioContext for visualizer reactivity
            if (audioCtx && analyser) {
              try {
                const source = audioCtx.createMediaElementSource(audio);
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                startAudioLevelMonitoring(source);
              } catch (connErr) {
                // If already connected or cross-origin, proceed without visualizer hook
              }
            }

            audio.onended = () => {
              stopAudioLevelMonitoring();
              currentAudioElementRef.current = null;
              onPlaybackComplete();
            };

            audio.onerror = (e) => {
              console.warn('Audio element error, falling back to browser speech synthesis:', e);
              fallbackBrowserTTS(text);
            };

            await audio.play();
            return;
          } else {
            fallbackBrowserTTS(text);
            return;
          }
        } catch (err: any) {
          console.warn('Gemini TTS failed, falling back to Web Speech Synthesis:', err.message);
          fallbackBrowserTTS(text);
          return;
        }
      } else {
        // Mode B: Web Speech Synthesis
        fallbackBrowserTTS(text);
      }

      function fallbackBrowserTTS(speechText: string) {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
          setState('completed');
          setTimeout(() => setState('idle'), 1000);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(speechText);
        currentUtteranceRef.current = utterance;
        utterance.rate = settingsRef.current.speakingRate || 1.0;
        utterance.pitch = settingsRef.current.pitch || 1.0;
        utterance.lang = currentLanguageRef.current.code;

        // Try to match selected voice or native Indian voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice =
          voices.find((v) => v.voiceURI === settingsRef.current.browserVoiceURI) ||
          voices.find((v) => v.lang.startsWith(currentLanguageRef.current.code.slice(0, 2))) ||
          voices.find((v) => v.lang.includes('IN')) ||
          voices[0];

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
          currentUtteranceRef.current = null;
          onPlaybackComplete();
        };

        utterance.onerror = (e) => {
          console.warn('SpeechSynthesis error:', e);
          currentUtteranceRef.current = null;
          setState('completed');
          setTimeout(() => setState('idle'), 800);
        };

        window.speechSynthesis.speak(utterance);
      }

      function onPlaybackComplete() {
        setState('completed');
        if (settingsRef.current.continuousMode) {
          setTimeout(() => {
            if (stateRef.current !== 'error' && stateRef.current !== 'interrupted') {
              startListening();
            }
          }, 800);
        } else {
          setTimeout(() => {
            setState('idle');
          }, 1200);
        }
      }
    },
    [setupAudioContext, startAudioLevelMonitoring, stopAllAudio, stopAudioLevelMonitoring]
  );

  // Send query to AI endpoint
  const sendTurnToAI = useCallback(
    async (userText: string) => {
      const cleanPrompt = userText.trim();
      if (!cleanPrompt) {
        setState('idle');
        return;
      }

      // Add user message to conversation history
      const userMessageId = `user-${Date.now()}`;
      const userMsg: Message = {
        id: userMessageId,
        role: 'user',
        content: cleanPrompt,
        timestamp: Date.now(),
        language: currentLanguageRef.current.code,
        status: 'success',
        isVoice: true,
      };

      setMessages((prev) => [...prev, userMsg]);
      setState('processing');
      setErrorInfo(null);
      setInterimTranscript('');
      setFinalTranscript('');

      try {
        const chatHistory = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: chatHistory,
            userMessage: cleanPrompt,
            language: currentLanguageRef.current.label,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${response.status}`);
        }

        const data = await response.json();
        const replyText = data.reply || 'Namaste, I received your message.';

        const assistantMsgId = `assistant-${Date.now()}`;
        const assistantMsg: Message = {
          id: assistantMsgId,
          role: 'assistant',
          content: replyText,
          timestamp: Date.now(),
          language: currentLanguageRef.current.code,
          status: 'success',
          isVoice: true,
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Speak the reply
        await speakResponse(replyText, assistantMsgId);
      } catch (err: any) {
        console.error('Error during AI turn:', err);
        setState('error');
        setErrorInfo({
          code: 'NETWORK_ERROR',
          title: 'Communication Issue',
          message: err.message || 'Unable to connect to Chandrakanti AI server.',
          recoverySuggestion:
            'Please verify your connection or click retry below. You can also type your message in text mode.',
          canRetry: true,
        });
      }
    },
    [messages, speakResponse]
  );

  // Start Speech Recognition (Web Speech API or Fallback MediaRecorder)
  const startListening = useCallback(async () => {
    setErrorInfo(null);
    setState('connecting');
    setInterimTranscript('');
    setFinalTranscript('');
    stopAllAudio();

    // 1. Request microphone permission
    try {
      const constraints: MediaStreamConstraints = {
        audio: settingsRef.current.micDeviceId
          ? { deviceId: { exact: settingsRef.current.micDeviceId } }
          : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      micStreamRef.current = stream;
      setIsMicAvailable(true);

      // Connect to audio context for visualizer
      const { audioCtx, analyser } = await setupAudioContext();
      if (audioCtx && analyser) {
        const sourceNode = audioCtx.createMediaStreamSource(stream);
        startAudioLevelMonitoring(sourceNode);
      }
    } catch (micErr: any) {
      console.error('Microphone permission or hardware error:', micErr);
      setIsMicAvailable(false);
      setState('error');

      if (
        micErr.name === 'NotAllowedError' ||
        micErr.name === 'PermissionDeniedError' ||
        micErr.message?.includes('Permission denied')
      ) {
        setErrorInfo({
          code: 'MIC_PERMISSION_DENIED',
          title: 'Microphone Permission Denied',
          message:
            'Browser access to your microphone was blocked. Chandrakanti needs microphone permission for voice conversations.',
          recoverySuggestion:
            'Click the camera/lock icon in your browser URL bar, set Microphone to "Allow", and reload or click Try Again.',
          canRetry: true,
        });
      } else if (micErr.name === 'NotFoundError' || micErr.name === 'DevicesNotFoundError') {
        setErrorInfo({
          code: 'MIC_NOT_FOUND',
          title: 'No Microphone Detected',
          message: 'No audio input hardware was found on your computer or phone.',
          recoverySuggestion:
            'Connect an external microphone or headset, or use the text input field below.',
          canRetry: true,
        });
      } else {
        setErrorInfo({
          code: 'MIC_RESTRICTED',
          title: 'Microphone Unavailable',
          message: micErr.message || 'Could not access the audio recording stream.',
          recoverySuggestion:
            'Ensure another application is not exclusively using your microphone.',
          canRetry: true,
        });
      }
      return;
    }

    // 2. Check for Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition && settingsRef.current.sttEngine === 'webspeech') {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = currentLanguageRef.current.code;
        recognition.maxAlternatives = 1;

        let accumulatedFinal = '';

        recognition.onstart = () => {
          setState('listening');
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulatedFinal += ' ' + transcript;
            } else {
              interim += transcript;
            }
          }

          setInterimTranscript(interim);
          const currentTotal = (accumulatedFinal + ' ' + interim).trim();
          setFinalTranscript(currentTotal);

          // Clear any pending silence timer
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          // If final words accumulated, set a short silence debounce to finish turn automatically
          if (accumulatedFinal.trim()) {
            silenceTimerRef.current = setTimeout(() => {
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.stop();
                } catch (e) {}
              }
              const finalQuery = accumulatedFinal.trim();
              if (finalQuery) {
                cleanupAudioContext();
                stopAudioLevelMonitoring();
                sendTurnToAI(finalQuery);
              }
            }, 1400);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error:', event.error);
          if (event.error === 'no-speech') {
            // Keep listening or timeout gracefully
            return;
          }
          if (event.error === 'not-allowed') {
            setState('error');
            setErrorInfo({
              code: 'MIC_PERMISSION_DENIED',
              title: 'Speech Recognition Denied',
              message: 'Microphone access was denied for speech recognition.',
              recoverySuggestion: 'Enable microphone permission in your browser settings.',
              canRetry: true,
            });
            stopAudioLevelMonitoring();
            cleanupAudioContext();
            return;
          }
          if (event.error === 'network') {
            console.warn('WebSpeech network error, attempting MediaRecorder fallback...');
            useMediaRecorderFallback();
          }
        };

        recognition.onend = () => {
          if (stateRef.current === 'listening') {
            // Turn ended naturally
            if (accumulatedFinal.trim()) {
              cleanupAudioContext();
              stopAudioLevelMonitoring();
              sendTurnToAI(accumulatedFinal.trim());
            } else {
              setState('idle');
              stopAudioLevelMonitoring();
              cleanupAudioContext();
            }
          }
        };

        recognition.start();
        return;
      } catch (err: any) {
        console.warn('Web Speech API failed to start, falling back to MediaRecorder:', err);
        useMediaRecorderFallback();
      }
    } else {
      // Fallback: MediaRecorder stream recording to /api/transcribe
      useMediaRecorderFallback();
    }

    function useMediaRecorderFallback() {
      if (!micStreamRef.current) return;
      try {
        recordedChunksRef.current = [];
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : 'audio/webm';

        const recorder = new MediaRecorder(micStreamRef.current, { mimeType });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          setState('processing');
          stopAudioLevelMonitoring();
          cleanupAudioContext();

          const audioBlob = new Blob(recordedChunksRef.current, { type: mimeType });
          if (audioBlob.size < 500) {
            setState('idle');
            return;
          }

          // Convert to base64 and send to /api/transcribe
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            try {
              const res = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioBase64: base64Data,
                  mimeType,
                  language: currentLanguageRef.current.label,
                }),
              });

              const data = await res.json();
              if (data.text && !data.empty) {
                sendTurnToAI(data.text);
              } else {
                setState('idle');
              }
            } catch (transcribeErr: any) {
              console.error('Transcription error:', transcribeErr);
              setState('error');
              setErrorInfo({
                code: 'NETWORK_ERROR',
                title: 'Transcription Failed',
                message: 'Could not process audio recording on the server.',
                recoverySuggestion: 'Try speaking again or use text fallback.',
                canRetry: true,
              });
            }
          };
        };

        recorder.start(250);
        setState('listening');
      } catch (recErr: any) {
        console.error('MediaRecorder error:', recErr);
        setState('error');
        setErrorInfo({
          code: 'SPEECH_NOT_SUPPORTED',
          title: 'Audio Capture Unsupported',
          message: 'Your browser does not support standard audio capture APIs.',
          recoverySuggestion: 'Please use a modern browser like Chrome, Edge, or Safari.',
          canRetry: false,
        });
      }
    }
  }, [
    cleanupAudioContext,
    sendTurnToAI,
    setupAudioContext,
    startAudioLevelMonitoring,
    stopAllAudio,
    stopAudioLevelMonitoring,
  ]);

  // Stop listening manually (e.g. user clicks mic button while listening)
  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    if (finalTranscript.trim()) {
      cleanupAudioContext();
      stopAudioLevelMonitoring();
      sendTurnToAI(finalTranscript.trim());
    } else {
      cleanupAudioContext();
      stopAudioLevelMonitoring();
      setState('idle');
    }
  }, [cleanupAudioContext, finalTranscript, sendTurnToAI, stopAudioLevelMonitoring]);

  // Toggle central mic button action
  const toggleListening = useCallback(() => {
    if (state === 'listening') {
      stopListening();
    } else if (state === 'speaking' || state === 'processing') {
      interruptPlayback();
    } else {
      startListening();
    }
  }, [interruptPlayback, startListening, state, stopListening]);

  // Send a manual text message (fallback or preference)
  const sendTextMessage = useCallback(
    (text: string) => {
      stopAllAudio();
      sendTurnToAI(text);
    },
    [sendTurnToAI, stopAllAudio]
  );

  // Replay a message
  const replayMessage = useCallback(
    (text: string, msgId: string) => {
      speakResponse(text, msgId);
    },
    [speakResponse]
  );

  // Clear conversation history
  const clearHistory = useCallback(() => {
    stopAllAudio();
    setState('idle');
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: currentLanguageRef.current.greeting,
        timestamp: Date.now(),
        language: currentLanguageRef.current.code,
        status: 'success',
      },
    ]);
  }, [stopAllAudio]);

  return {
    state,
    messages,
    currentLanguage,
    settings,
    interimTranscript,
    finalTranscript,
    errorInfo,
    isMicAvailable,
    audioLevel,
    analyserRef,
    availableVoices,
    audioDevices,
    setSettings,
    changeLanguage,
    toggleListening,
    startListening,
    stopListening,
    interruptPlayback,
    sendTextMessage,
    replayMessage,
    clearHistory,
    setErrorInfo,
  };
}
