import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // Dev server must run on port 3000 for AI Studio environment
  const port = process.env.NODE_ENV === 'production' ? Number(process.env.PORT) || 3000 : 3000;

  app.use(express.json({ limit: '35mb' }));

  // Initialize shared server-side Gemini client
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY is not set in environment. Gemini features will be unavailable until configured.');
  }

  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!apiKey,
      agent: 'Chandrakanti',
      creator: 'Saipratap Developer',
      timestamp: new Date().toISOString(),
    });
  });

  // Chat conversation endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: 'Gemini API key is not configured on the server. Please check the Secrets configuration.',
        });
      }

      const { messages, userMessage, language, persona } = req.body;

      if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
        return res.status(400).json({ error: 'User message is required.' });
      }

      const selectedLanguage = language || 'en-IN';
      const promptText = userMessage.trim();

      // System instruction formatted specifically for high quality spoken voice delivery
      const systemInstruction = `You are "Chandrakanti", an intelligent, warm, respectful, and articulate AI Voice Agent developed by Saipratap Developer.
You communicate via spoken audio in real time.

CORE GUIDELINES:
1. Spoken Voice Optimization: Your responses will be read aloud by a Text-to-Speech engine. Keep answers conversational, natural, and concise (typically 1 to 3 short sentences, max 45 words, unless the user explicitly asks for an in-depth explanation or list).
2. Clean Audio Formatting: DO NOT use markdown headers (###), asterisks (*, **), bullet points, numbered lists, or markdown tables. Speak in fluid natural prose with clear punctuation so the voice synthesizer pauses naturally.
3. Multilingual Capability: The user selected language context is "${selectedLanguage}". If the user speaks in an Indian language (e.g. Hindi, Odia, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi) or English, reply naturally and respectfully in that exact language using accurate native Unicode script or natural phrasing.
4. Accuracy & Honesty: Never invent facts or claim an action has been taken unless verified. If the user speech is unclear or incomplete, politely ask them to repeat or clarify: "I couldn't hear that clearly, could you please repeat?"
5. Personality: Courteous, humble, helpful, and energetic Indian AI companion.
6. Context Retention: Use conversation history to maintain cohesive, natural multi-turn dialogue.`;

      // Build conversation history for multi-turn context
      // Format messages into contents array for Gemini
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(messages)) {
        for (const msg of messages.slice(-10)) {
          if (msg.role === 'user') {
            contents.push({ role: 'user', parts: [{ text: msg.content }] });
          } else if (msg.role === 'assistant' || msg.role === 'model') {
            contents.push({ role: 'model', parts: [{ text: msg.content }] });
          }
        }
      }

      // Append current user message
      contents.push({ role: 'user', parts: [{ text: promptText }] });

      let response;
      const modelCandidates = [
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-3.5-flash',
        'gemini-3.8-flash',
      ];
      let lastError: any = null;

      for (const modelName of modelCandidates) {
        try {
          const config: any = {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 250,
          };

          if (modelName === 'gemini-3.8-flash') {
            config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
          }

          const generatePromise = ai.models.generateContent({
            model: modelName,
            contents,
            config,
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout requesting ${modelName}`)), 15000)
          );

          response = (await Promise.race([generatePromise, timeoutPromise])) as any;
          if (response && response.text) {
            break;
          }
        } catch (mErr: any) {
          console.warn(`Model ${modelName} error:`, mErr.message);
          lastError = mErr;
        }
      }

      if (response && response.text) {
        const replyText = response.text.trim();
        return res.json({
          reply: replyText,
          detectedLanguage: selectedLanguage,
        });
      }

      // If all candidates failed due to 503/429 high demand spikes, provide an intelligent spoken fallback
      console.warn('All Gemini models encountered transient rate limits or 503 spikes. Returning graceful conversational fallback.');
      
      const fallbackGreetings: Record<string, string> = {
        'hi-IN': 'माफ़ कीजिए, नेटवर्क में कुछ क्षणिक रुकावट आई थी। मैं सुनने के लिए तैयार हूँ, कृपया अपनी बात फिर से कहें।',
        'or-IN': 'କ୍ଷମା କରିବେ, ନେଟୱର୍କରେ କିଛି ସାମୟିକ ସମସ୍ୟା ହୋଇଥିଲା। ମୁଁ ଆପଣଙ୍କୁ ଶୁଣିବା ପାଇଁ ପ୍ରସ୍ତୁତ, ଦୟାକରି ପୁଣି କୁହନ୍ତୁ।',
        'bn-IN': 'দুঃখিত, সংযোগে ক্ষণিকের ত্রুটি হয়েছিল। আমি শুনতে প্রস্তুত, দয়া করে আবার বলুন।',
        'ta-IN': 'மன்னிக்கவும், நெட்வொர்க்கில் சிறிய தாமதம் ஏற்பட்டது. நான் கேட்க தயாராக உள்ளேன், தயவுசெய்து மீண்டும் சொல்லுங்கள்.',
        'te-IN': 'క్షమించండి, నెట్‌వర్క్‌లో తాత్కాలిక సమస్య వచ్చింది. నేను వినడానికి సిద్ధంగా ఉన్నాను, దయచేసి మళ్లీ చెప్పండి.',
      };

      const fallbackText = fallbackGreetings[selectedLanguage] || 
        'I am listening, but our neural connection had a momentary spike. I am ready now, could you please repeat that?';

      return res.json({
        reply: fallbackText,
        detectedLanguage: selectedLanguage,
        isTransientFallback: true,
      });
    } catch (err: any) {
      console.error('Error in /api/chat:', err);
      return res.status(500).json({
        error: err.message || 'Failed to generate response from Chandrakanti AI.',
      });
    }
  });

  // Text-To-Speech endpoint with multi-model fallback
  app.post('/api/tts', async (req, res) => {
    try {
      if (!ai) {
        return res.json({
          fallbackRecommended: true,
          useBrowserSpeech: true,
          message: 'Gemini API key not configured on server. Using browser speech.',
        });
      }

      const { text, voiceName, speechStyle } = req.body;

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Text is required for speech synthesis.' });
      }

      // Valid prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
      const allowedVoices = ['Kore', 'Zephyr', 'Fenrir', 'Puck', 'Charon'];
      const selectedVoice = allowedVoices.includes(voiceName) ? voiceName : 'Kore';

      // Clean up text for speech synthesis (remove stray symbols)
      const cleanText = text
        .replace(/[*#_~`\[\]()<>]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // List of neural TTS models to try in order of quota availability
      const ttsCandidates = [
        'gemini-3.1-flash-tts-preview',
        'gemini-3.8-flash-tts',
        'gemini-2.5-flash-preview-tts',
        'gemini-3.8-flash-lite-tts',
      ];

      let base64Audio: string | undefined;
      let lastTtsError: any = null;

      for (const ttsModel of ttsCandidates) {
        try {
          const response = await ai.models.generateContent({
            model: ttsModel,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: cleanText,
                    speechMetadata: {
                      style: speechStyle || 'Warm, articulate, friendly conversational assistant',
                    },
                  },
                ],
              },
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: selectedVoice },
                },
              },
            },
          });

          base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            return res.json({
              audioBase64: base64Audio,
              mimeType: 'audio/wav',
              voice: selectedVoice,
              modelUsed: ttsModel,
            });
          }
        } catch (ttsErr: any) {
          lastTtsError = ttsErr;
          // Quietly try next candidate if rate limited or unavailable
          console.warn(`TTS model ${ttsModel} returned ${ttsErr.status || ttsErr.message?.slice(0, 60)}, trying next candidate...`);
        }
      }

      // If all neural models are exhausted, gracefully notify client to use Web Speech Synthesis
      console.warn('All neural TTS models quota exhausted or unavailable. Falling back to browser speech synthesis.');
      return res.json({
        fallbackRecommended: true,
        useBrowserSpeech: true,
        message: 'All neural TTS quotas reached. Using browser speech synthesis fallback.',
      });
    } catch (err: any) {
      console.warn('Unexpected error in /api/tts, defaulting to browser speech:', err.message);
      return res.json({
        fallbackRecommended: true,
        useBrowserSpeech: true,
        error: err.message,
      });
    }
  });

  // Audio transcription fallback endpoint
  app.post('/api/transcribe', async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: 'Gemini API key is not configured on the server.',
        });
      }

      const { audioBase64, mimeType, language } = req.body;

      if (!audioBase64) {
        return res.status(400).json({ error: 'Audio data is required.' });
      }

      const effectiveMimeType = mimeType || 'audio/webm';
      const langHint = language ? ` The expected language is ${language}.` : '';

      const audioPart = {
        inlineData: {
          mimeType: effectiveMimeType,
          data: audioBase64,
        },
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            audioPart,
            {
              text: `Transcribe the spoken audio accurately into text.${langHint} Return only the transcription verbatim without explanations, quotes, or markdown. If no intelligible speech is detected, return EMPTY_AUDIO.`,
            },
          ],
        },
      });

      const transcription = response.text?.trim() || '';

      if (transcription.toUpperCase().includes('EMPTY_AUDIO') || !transcription) {
        return res.json({ text: '', empty: true });
      }

      return res.json({ text: transcription, empty: false });
    } catch (err: any) {
      console.error('Error in /api/transcribe:', err);
      // Fallback to gemini-3.8-flash if transcribe model is busy
      if (!ai) {
        return res.status(500).json({ error: 'Gemini AI client not initialized.' });
      }
      try {
        const { audioBase64, mimeType } = req.body;
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'audio/webm',
                  data: audioBase64,
                },
              },
              {
                text: 'Transcribe what is spoken in this audio. Return only the transcription text.',
              },
            ],
          },
        });
        const text = response.text?.trim() || '';
        return res.json({ text, empty: !text });
      } catch (innerErr: any) {
        return res.status(500).json({
          error: innerErr.message || 'Audio transcription failed.',
        });
      }
    }
  });

  // In production, serve dist folder; in dev, mount Vite middlewares
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Chandrakanti Voice Agent Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
