/**
 * System TTS Engine (say.js)
 * ===========================
 * Tizim TTS engine'ini ishlatadi (espeak, festival, macOS say)
 * Matnni gaplarga bo'lib, pauzalar bilan o'qiydi
 */

const { spawnSync } = require('child_process');
const say = require('say');
const { splitIntoSentences } = require('../text/tokenizer');

const ENGINE_NAME = 'say';

/**
 * Tizimda TTS engine mavjudligini tekshiradi
 * @returns {boolean}
 */
function isAvailable() {
  if (process.platform !== 'linux') {
    return true; // macOS va Windows da say.js ishlaydi
  }

  const check = spawnSync('sh', [
    '-c',
    'command -v festival >/dev/null 2>&1 || command -v espeak >/dev/null 2>&1',
  ]);
  return check.status === 0;
}

/**
 * Bitta gap/bo'lakni o'qiydi
 * @param {string} text
 * @param {string|undefined} voice
 * @param {number} speed
 * @returns {Promise<void>}
 */
function speakPart(text, voice, speed) {
  return new Promise((resolve, reject) => {
    say.speak(text, voice, speed, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/**
 * Matnni gaplarga bo'lib, natural pauzalar bilan o'qiydi
 *
 * @param {string} text — o'qiladigan matn
 * @param {object} options
 * @param {string} [options.voice] — voice nomi
 * @param {number} [options.speed] — o'qish tezligi (default: 1)
 * @param {number} [options.pauseMs] — gaplar orasidagi pauza (ms, default: 150)
 * @returns {Promise<void>}
 */
async function synthesize(text, options = {}) {
  const { voice, speed = 1, pauseMs = 150 } = options;

  if (!isAvailable()) {
    throw new Error(
      '[say] Tizim TTS engine topilmadi (festival/espeak).\n' +
      'Yechim: sudo apt install espeak yoki --engine gtts/openai ishlatilsin.'
    );
  }

  const parts = splitIntoSentences(text);

  if (parts.length === 0) {
    await speakPart(text, voice, speed);
    return;
  }

  for (let i = 0; i < parts.length; i++) {
    await speakPart(parts[i], voice, speed);

    // Oxirgi gapdan keyin pauza shart emas
    if (i < parts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, pauseMs));
    }
  }
}

/**
 * Ushbu engine haqida ma'lumot
 */
function info() {
  return {
    name: ENGINE_NAME,
    description: 'Tizim TTS (espeak/festival/macOS say)',
    supportsLive: true,
    supportsFile: false,
    quality: '⭐⭐ Oddiy',
    available: isAvailable(),
  };
}

module.exports = {
  ENGINE_NAME,
  synthesize,
  isAvailable,
  info,
};
