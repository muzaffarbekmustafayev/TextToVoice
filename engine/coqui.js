/**
 * Coqui TTS Engine (Client)
 * ==========================
 * Mahalliy yoki masofaviy Coqui TTS API (FastAPI) bilan ishlaydi.
 * Bu engine eng yuqori sifatli va moslashuvchan variant hisoblanadi.
 *
 * Stack: Node.js CLI → FastAPI → Coqui TTS (Uzbek Model)
 */

const fs = require('fs');
const path = require('path');

const ENGINE_NAME = 'coqui';

/**
 * Coqui TTS API orqali MP3 yaratadi
 *
 * @param {string} text — ovozga aylantiriladigan matn
 * @param {object} options
 * @param {string} [options.output] — chiqish fayl yo'li
 * @param {string} [options.apiUrl] — FastAPI server manzili (default: http://localhost:8000/tts)
 * @param {string} [options.voice] — speaker nomi yoki IDsi
 * @returns {Promise<string>} — saqlangan fayl yo'li
 */
async function synthesize(text, options = {}) {
  const {
    output,
    apiUrl = process.env.COQUI_API_URL || 'http://localhost:8000/tts',
    voice = 'uzbek_voice_1',
    speed = 1,
  } = options;

  if (!output) {
    throw new Error('[Coqui] --output parametri majburiy');
  }

  const outputPath = path.resolve(output);
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    // Node.js 18+ dagi built-in fetch ishlatiladi
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        speaker_id: voice,
        speed: speed,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(`API Xatolik: ${errData.detail || response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
  } catch (err) {
    if (err.cause && err.cause.code === 'ECONNREFUSED') {
      throw new Error(
        `[Coqui] API serverga ulanib bo'lmadi (${apiUrl}).\n` +
        `Yechim: FastAPI serveringiz ishlayotganiga ishonch hosil qiling.`
      );
    }
    throw new Error(`[Coqui] TTS xatolik: ${err.message || err}`);
  }
}

/**
 * Ushbu engine haqida ma'lumot
 */
function info() {
  const apiUrl = process.env.COQUI_API_URL || 'http://localhost:8000/tts';
  return {
    name: ENGINE_NAME,
    description: 'Coqui TTS (Local API) — professional darajadagi Uzbek TTS',
    supportsLive: false,
    supportsFile: true,
    quality: '⭐⭐⭐⭐⭐ Professional (Fine-tuned model bilan)',
    apiUrl: apiUrl,
    note: 'FastAPI server talab qilinadi (localhost:8000)',
  };
}

module.exports = {
  ENGINE_NAME,
  synthesize,
  info,
};
