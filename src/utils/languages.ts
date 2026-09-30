import { LanguageOption, QuickPrompt } from '../types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en-IN',
    label: 'English (India)',
    nativeLabel: 'English (IN)',
    greeting: 'Namaste! I am Chandrakanti. How may I assist you today?',
    samplePrompt: 'What are the latest developments in India\'s space programme?',
    region: 'India / Global',
  },
  {
    code: 'hi-IN',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    greeting: 'नमस्ते! मैं चंद्रकांति हूँ। आज मैं आपकी क्या सहायता कर सकती हूँ?',
    samplePrompt: 'आज का दिन सकारात्मक रूप से कैसे शुरू करें?',
    region: 'India',
  },
  {
    code: 'or-IN',
    label: 'Odia',
    nativeLabel: 'ଓଡ଼ିଆ',
    greeting: 'ନମସ୍କାର! ମୁଁ ଚନ୍ଦ୍ରକାନ୍ତି। ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
    samplePrompt: 'ଓଡ଼ିଶାର ପ୍ରମୁଖ ଐତିହ୍ୟ ସ୍ଥଳ ବିଷୟରେ କିଛି କୁହନ୍ତୁ।',
    region: 'Odisha, India',
  },
  {
    code: 'bn-IN',
    label: 'Bengali',
    nativeLabel: 'বাংলা',
    greeting: 'নমস্কার! আমি চন্দ্রকান্তি। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
    samplePrompt: 'কলকাতার ঐতিহাসিক আকর্ষণগুলি কী কী?',
    region: 'West Bengal, India',
  },
  {
    code: 'ta-IN',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
    greeting: 'வணக்கம்! நான் சந்திரகாந்தி. இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
    samplePrompt: 'திருக்குறளின் முக்கிய கருத்து என்ன?',
    region: 'Tamil Nadu, India',
  },
  {
    code: 'te-IN',
    label: 'Telugu',
    nativeLabel: 'తెలుగు',
    greeting: 'నమస్కారం! నేను చంద్రకాంతిని. ఈ రోజు మీకు ఏ విధంగా సహాయపడగలను?',
    samplePrompt: 'భారతీయ శాస్త్రవేత్తల ఘనతలు ఏమిటి?',
    region: 'Andhra Pradesh & Telangana, India',
  },
  {
    code: 'mr-IN',
    label: 'Marathi',
    nativeLabel: 'मराठी',
    greeting: 'नमस्कार! मी चंद्रकांती आहे. आज मी तुम्हाला कशी मदत करू शकते?',
    samplePrompt: 'महाराष्ट्रातील गडकिल्ल्यांचे ऐतिहासिक महत्त्व काय आहे?',
    region: 'Maharashtra, India',
  },
  {
    code: 'gu-IN',
    label: 'Gujarati',
    nativeLabel: 'ગુજરાતી',
    greeting: 'નમસ્તે! હું ચંદ્રકાંતિ છું. આજે હું તમારી શું મદદ કરી શકું?',
    samplePrompt: 'ગુજરાતની સંસ્કૃતિ અને હસ્તકળા વિશે જણાવો.',
    region: 'Gujarat, India',
  },
  {
    code: 'kn-IN',
    label: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ',
    greeting: 'ನಮಸ್ಕಾರ! ನಾನು ಚಂದ್ರಕಾಂತಿ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    samplePrompt: 'ಕರ್ನಾಟಕದ ಸಂಸ್ಕೃತಿಯ ಪ್ರಮುಖ ವೈಶಿಷ್ಟ್ಯಗಳು ಯಾವುವು?',
    region: 'Karnataka, India',
  },
  {
    code: 'ml-IN',
    label: 'Malayalam',
    nativeLabel: 'മലയാളം',
    greeting: 'നമസ്കാരം! ഞാൻ ചന്ദ്രകാന്തി. ഇന്ന് ഞാൻ നിങ്ങൾക്ക് എങ്ങനെ സഹായിക്കണം?',
    samplePrompt: 'കേരളത്തിലെ പ്രകൃതി സൗന്ദര്യത്തെക്കുറിച്ച് പറയൂ.',
    region: 'Kerala, India',
  },
  {
    code: 'pa-IN',
    label: 'Punjabi',
    nativeLabel: 'ਪੰਜਾਬੀ',
    greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਚੰਦਰਕਾਂਤੀ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ?',
    samplePrompt: 'ਪੰਜਾਬ ਦੇ ਵਿਰਸੇ ਅਤੇ ਲੋਕ ਨਾਚ ਬਾਰੇ ਦੱਸੋ।',
    region: 'Punjab, India',
  },
  {
    code: 'en-US',
    label: 'English (US)',
    nativeLabel: 'English (US)',
    greeting: 'Hello! I am Chandrakanti. How can I help you today?',
    samplePrompt: 'Explain how artificial intelligence neural networks function simply.',
    region: 'International',
  },
];

export const QUICK_PROMPTS_BY_LANG: Record<string, QuickPrompt[]> = {
  'en-IN': [
    {
      id: 'q1',
      label: '🚀 India in Space',
      query: 'What are ISRO\'s upcoming key space exploration missions?',
      category: 'tech',
    },
    {
      id: 'q2',
      label: '💡 Daily Inspiration',
      query: 'Give me a short inspiring thought and productive tip for today.',
      category: 'general',
    },
    {
      id: 'q3',
      label: '🔬 Explain Quantum AI',
      query: 'Explain quantum computing in three simple sentences.',
      category: 'tech',
    },
    {
      id: 'q4',
      label: '🏛️ Heritage of Konark',
      query: 'Tell me the architectural significance of the Sun Temple at Konark.',
      category: 'culture',
    },
  ],
  'hi-IN': [
    {
      id: 'qh1',
      label: '🌟 सुविचार और प्रेरणा',
      query: 'आज के लिए एक प्रेरक विचार और कार्यकुशलता की सलाह दीजिए।',
      category: 'general',
    },
    {
      id: 'qh2',
      label: '🚀 भारत का अंतरिक्ष मिशन',
      query: 'इसरो के आगामी अंतरिक्ष अभियानों की मुख्य जानकारी दीजिए।',
      category: 'tech',
    },
    {
      id: 'qh3',
      label: '🧘 योग और मानसिक शांति',
      query: 'तनाव मुक्ति और एकाग्रता के लिए दो सरल प्राणायाम बताइए।',
      category: 'culture',
    },
    {
      id: 'qh4',
      label: '💡 विज्ञान की पहेली',
      query: 'आर्टिफिशियल इंटेलिजेंस इंसानों की रोज़मर्रा की ज़िंदगी कैसे बदल रहा है?',
      category: 'tech',
    },
  ],
  'or-IN': [
    {
      id: 'qo1',
      label: '🏛️ କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର',
      query: 'କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିରର ବିଶେଷତା ବିଷୟରେ ସଂକ୍ଷେପରେ କୁହନ୍ତୁ।',
      category: 'culture',
    },
    {
      id: 'qo2',
      label: '✨ ସୁପ୍ରଭାତ ପ୍ରେରଣା',
      query: 'ଆଜିର ଦିନ ପାଇଁ ଏକ ସୁନ୍ଦର ଉତ୍ସାହପ୍ରଦ ଚିନ୍ତାଧାରା ଦିଅନ୍ତୁ।',
      category: 'general',
    },
    {
      id: 'qo3',
      label: '🌊 ଓଡ଼ିଶାର ସଂସ୍କୃତି',
      query: 'ଓଡ଼ିଶାର ଜଗନ୍ନାଥ ସଂସ୍କୃତି ଓ ପର୍ବପର୍ବାଣି ବିଷୟରେ କିଛି କୁହନ୍ତୁ।',
      category: 'culture',
    },
    {
      id: 'qo4',
      label: '💡 ବିଜ୍ଞାନ ଓ ପ୍ରଯୁକ୍ତି',
      query: 'କୃତ୍ରିମ ବୁଦ୍ଧିମତ୍ତା ବା ଏଆଇ କିପରି କାମ କରେ ସହଜ ଭାଷାରେ ବୁଝାନ୍ତୁ।',
      category: 'tech',
    },
  ],
};

export function getQuickPromptsForLang(langCode: string): QuickPrompt[] {
  if (QUICK_PROMPTS_BY_LANG[langCode]) {
    return QUICK_PROMPTS_BY_LANG[langCode];
  }
  return QUICK_PROMPTS_BY_LANG['en-IN'];
}

export function getLanguageByCode(code: string): LanguageOption {
  return (
    SUPPORTED_LANGUAGES.find((lang) => lang.code === code) ||
    SUPPORTED_LANGUAGES[0]
  );
}
