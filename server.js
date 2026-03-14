/**
 * Coqui TTS Server (Node.js + Express)
 * ======================================
 * Python FastAPI server o'rniga Node.js versiyasi.
 * Coqui TTS modelini child_process orqali chaqiradi.
 *
 * O'rnatish:
 *   npm install express
 *   pip install TTS   (Coqui TTS Python paketi hali ham kerak)
 *
 * Ishga tushirish:
 *   node server.js
 */

const express      = require('express');
const { execFile } = require('child_process');
const fs           = require('fs');
const os           = require('os');
const path         = require('path');

const PORT     = process.env.PORT         || 8000;
const MODEL    = process.env.COQUI_MODEL  || 'tts_models/multilingual/multi-dataset/xtts_v2';
const LANGUAGE = process.env.COQUI_LANG   || 'uz';

const app = express();
app.use(express.json());

/**
 * Coqui TTS CLI orqali matnni audio faylga aylantiradi
 */
function runCoqui(text, speaker, outPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-m', MODEL,
      '--text', text,
      '--out_path', outPath,
      '--language_idx', LANGUAGE,
    ];
    if (speaker) args.push('--speaker_idx', speaker);

    execFile('tts', args, (err, _stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve();
    });
  });
}

// POST /tts — matnni audio ga aylantiradi
app.post('/tts', async (req, res) => {
  const { text, speaker_id = 'Claribel Dervla' } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ detail: '"text" maydoni majburiy' });
  }

  const tmpFile = path.join(os.tmpdir(), `tts_${Date.now()}.wav`);

  try {
    await runCoqui(text, speaker_id, tmpFile);
    const audio = fs.readFileSync(tmpFile);
    res.set('Content-Type', 'audio/wav');
    res.send(audio);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  } finally {
    fs.rm(tmpFile, () => {});
  }
});

// GET /health — server holati
app.get('/health', (_req, res) => res.json({ status: 'ok', model: MODEL }));

app.listen(PORT, () => {
  console.log(`🔊 Coqui TTS server: http://localhost:${PORT}`);
  console.log(`   Model: ${MODEL}`);
  console.log(`   Til:   ${LANGUAGE}`);
});
