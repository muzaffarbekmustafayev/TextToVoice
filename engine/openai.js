/**
 * OpenAI TTS Engine
 * ==================
 * OpenAI API orqali yuqori sifatli ovoz yaratadi
 * Uzbek tilini eng yaxshi o'qiydigan engine
 *
 * gpt-4o-mini-tts modeli `instructions` parametrini qo'llab-quvvatlaydi —
 * bu orqali aksent, ohang, va talaffuz uslubini boshqarish mumkin.
 *
 * Talablar:
 *   - OPENAI_API_KEY environment variable o'rnatilgan bo'lishi kerak
 *   - openai npm paketi o'rnatilgan bo'lishi kerak
 */

const fs = require('fs');
const path = require('path');

const ENGINE_NAME = 'openai';

// Mavjud ovoz turlari
const VOICES = ['alloy', 'ash', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer'];

// Mavjud modellar
const MODELS = ['tts-1', 'tts-1-hd', 'gpt-4o-mini-tts'];

// ─── Aksent profillari ───────────────────────────────────────
// gpt-4o-mini-tts modeli uchun `instructions` — ovoz uslubini boshqaradi
const ACCENT_PROFILES = {
  uzbek: {
    name: 'Tabiiy O\'zbek tili',
    instructions: [
      'You are a native Uzbek speaker.',
      'Speak in a natural, clear, and modern Uzbek language.',
      'Pronounce "o\'", "g\'", "sh", "ch", and "ng" naturally as in standard Uzbek.',
      'Maintain a neutral tone without regional dialects.',
      'Use professional and clear intonation.',
    ].join(' '),
  },
  toshkent: {
    name: 'Toshkent shevasi',
    instructions: 'Speak Uzbek with a mild Tashkent accent, sounding urban and modern.',
  },
  samarqand: {
    name: 'Samarqand aksenti',
    instructions: [
      'You are speaking Uzbek language text with a Samarkand regional accent.',
      'Use Samarkand Uzbek pronunciation characteristics:',
      '- More melodic and sing-song intonation',
      '- Slightly elongated vowels',
      '- Stronger emphasis on uvular sounds "q" and "g\'"',
      '- Traditional, warm speaking style',
      '- Moderate speaking pace',
      'Pronounce all Uzbek-specific sounds clearly:',
      '- "sh", "ch" as distinct single consonants',
      '- "x" as a clear uvular fricative',
      '- Rounded "o\'" vowel',
      'Speak with a dignified, traditional Uzbek cadence.',
    ].join(' '),
  },
  formal: {
    name: 'Rasmiy uslub',
    instructions: [
      'You are reading an official Uzbek language text.',
      'Use formal, literary Uzbek pronunciation.',
      'Speak clearly and precisely like a professional news anchor.',
      'Each word should be articulated clearly with proper Uzbek phonetics.',
      '- "sh", "ch" as clean single consonants',
      '- Clear distinction between "o\'" and "o"',
      '- Proper uvular "q" and "g\'"',
      '- "x" as a clear fricative',
      'Maintain a steady, authoritative pace.',
      'Use deliberate pauses at punctuation marks.',
      'Place stress consistently on the last syllable.',
      'Sound professional, neutral, and clear.',
    ].join(' '),
  },
  kitob: {
    name: 'Audiobook uslubi',
    instructions: [
      'You are narrating an Uzbek audiobook.',
      'Read with expressive, engaging Uzbek pronunciation.',
      'Use authentic Uzbek accent with:',
      '- Warm, rich vocal quality',
      '- Varied intonation to keep listeners engaged',
      '- Longer pauses between sentences',
      '- Emotional expression matching the content',
      '- Slightly slower pace for comprehension',
      'Pronounce Uzbek sounds naturally:',
      '- "sh", "ch" as fluid single sounds',
      '- Smooth "o\'" and "g\'" transitions',
      '- Gentle "x" and deep "q"',
      'Make the listener feel like they are hearing a native Uzbek storyteller.',
    ].join(' '),
  },
};

/**
 * OpenAI TTS orqali MP3 fayl yaratadi
 *
 * @param {string} text — ovozga aylantiriladigan matn
 * @param {object} options
 * @param {string} [options.output] — chiqish fayl yo'li (majburiy)
 * @param {string} [options.voice] — ovoz turi (default: 'alloy')
 * @param {string} [options.model] — model (default: 'gpt-4o-mini-tts')
 * @param {number} [options.speed] — tezlik 0.25 - 4.0 (default: 1)
 * @param {string} [options.accent] — aksent profili (default: 'uzbek')
 * @returns {Promise<string>} — saqlangan fayl yo'li
 */
async function synthesize(text, options = {}) {
  const {
    output,
    voice = 'alloy',
    model = 'gpt-4o-mini-tts',
    speed = 1,
    accent = 'uzbek',
  } = options;

  if (!output) {
    throw new Error('[OpenAI] --output parametri majburiy (MP3 fayl yo\'li)');
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      '[OpenAI] OPENAI_API_KEY environment variable topilmadi.\n' +
      'Yechim: export OPENAI_API_KEY="sk-..." buyrug\'ini bajaring.'
    );
  }

  // Ovoz nomini tekshirish
  const voiceName = voice.toLowerCase();
  if (!VOICES.includes(voiceName)) {
    throw new Error(
      `[OpenAI] Noto'g'ri voice: "${voice}"\n` +
      `Mavjud ovozlar: ${VOICES.join(', ')}`
    );
  }

  // Tezlikni tekshirish
  if (speed < 0.25 || speed > 4.0) {
    throw new Error('[OpenAI] Speed 0.25 dan 4.0 gacha bo\'lishi kerak.');
  }

  let OpenAI;
  try {
    OpenAI = require('openai');
  } catch {
    throw new Error(
      '[OpenAI] openai paketi o\'rnatilmagan.\n' +
      'Yechim: npm install openai'
    );
  }

  const client = new OpenAI({ apiKey });

  const outputPath = path.resolve(output);
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Aksent profilini olish
  const accentProfile = ACCENT_PROFILES[accent] || ACCENT_PROFILES.uzbek;
  const supportsInstructions = model === 'gpt-4o-mini-tts';

  if (supportsInstructions) {
    console.log(`  ✓ Aksent: ${accentProfile.name}`);
  }

  try {
    // API requestni tayyorlash
    const requestBody = {
      model,
      voice: voiceName,
      input: text,
      speed,
      response_format: 'mp3',
    };

    // faqat gpt-4o-mini-tts instructions ni qo'llab-quvvatlaydi
    if (supportsInstructions) {
      requestBody.instructions = accentProfile.instructions;
    }

    const response = await client.audio.speech.create(requestBody);

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
  } catch (err) {
    if (err.status === 401) {
      throw new Error('[OpenAI] API key noto\'g\'ri yoki muddati o\'tgan.');
    }
    if (err.status === 429) {
      throw new Error('[OpenAI] Rate limit — biroz kuting va qayta urinib ko\'ring.');
    }
    throw new Error(`[OpenAI] TTS xatolik: ${err.message || err}`);
  }
}

/**
 * Ushbu engine haqida ma'lumot
 */
function info() {
  const hasKey = !!process.env.OPENAI_API_KEY;
  return {
    name: ENGINE_NAME,
    description: 'OpenAI TTS — eng yuqori sifat, Uzbek aksenti bilan',
    supportsLive: false,
    supportsFile: true,
    quality: '⭐⭐⭐⭐⭐ Eng yaxshi',
    available: hasKey,
    voices: VOICES,
    models: MODELS,
    accents: Object.entries(ACCENT_PROFILES).map(([k, v]) => `${k} (${v.name})`),
    note: hasKey
      ? 'OPENAI_API_KEY topildi ✅'
      : 'OPENAI_API_KEY o\'rnatilmagan ❌ (export OPENAI_API_KEY="sk-...")',
  };
}

module.exports = {
  ENGINE_NAME,
  synthesize,
  info,
  VOICES,
  MODELS,
  ACCENT_PROFILES,
};
