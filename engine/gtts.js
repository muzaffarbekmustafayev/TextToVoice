/**
 * Google TTS Engine
 * ==================
 * Google Translate TTS orqali MP3 yaratadi
 * Sifati o'rtacha, lekin bepul va API key talab qilmaydi
 */

const fs = require('fs');
const path = require('path');
const gTTS = require('gtts');
const { processTextForTurkish } = require('../text/normalize');

const ENGINE_NAME = 'gtts';

// gTTS da mavjud bo'lmagan tillar uchun fallback
// 'uz' (o'zbek) → 'tr' (turk) — eng yaqin turkiy til
const LANG_FALLBACK = {
  uz: 'tr',
};

/**
 * gTTS orqali MP3 fayl yaratadi
 *
 * @param {string} text — ovozga aylantiriladigan matn
 * @param {object} options
 * @param {string} options.lang — til kodi (default: 'uz')
 * @param {string} options.output — chiqish fayl yo'li
 * @returns {Promise<string>} — saqlangan fayl yo'li
 */
async function synthesize(text, options = {}) {
  let { lang = 'uz', output } = options;

  // Uz tilini turk tiliga fallback
  const isTurkishFallback = !!LANG_FALLBACK[lang];
  if (isTurkishFallback) {
    const fallbackLang = LANG_FALLBACK[lang];
    console.log(`  ⚠ gTTS "${lang}" → "${fallbackLang}" fallback`);
    lang = fallbackLang;
  }

  if (!output) {
    throw new Error('[gTTS] --output parametri majburiy (MP3 fayl yo\'li)');
  }

  // Turk TTS uchun harflarni mapping qilish
  // sh→ş, ch→ç, g'→ğ, o'→ö, x→h, q→k
  let processedText = text;
  if (isTurkishFallback) {
    processedText = processTextForTurkish(text);
    console.log(`  ✓ Turk fonemalariga map qilindi`);
  }

  const outputPath = path.resolve(output);
  const outputDir = path.dirname(outputPath);

  // Papka mavjud bo'lmasa yaratish
  fs.mkdirSync(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const tts = new gTTS(processedText, lang);

    tts.save(outputPath, (err) => {
      if (err) {
        reject(new Error(`[gTTS] MP3 yaratishda xatolik: ${err.message || err}`));
        return;
      }

      resolve(outputPath);
    });
  });
}

/**
 * Ushbu engine haqida ma'lumot
 */
function info() {
  return {
    name: ENGINE_NAME,
    description: 'Google Translate TTS — bepul, API key shart emas',
    supportsLive: false,
    supportsFile: true,
    quality: '⭐⭐ O\'rtacha (Uzbek uchun cheklangan)',
  };
}

module.exports = {
  ENGINE_NAME,
  synthesize,
  info,
};
