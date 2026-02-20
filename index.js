const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const say = require('say');
const gTTS = require('gtts');

function parseArgs(argv) {
  const options = {
    text: '',
    voice: undefined,
    speed: 1,
    lang: 'uz',
    output: undefined,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg.startsWith('--text=')) {
      options.text = arg.slice('--text='.length).trim();
      continue;
    }

    if (arg === '--text') {
      options.text = (argv[i + 1] || '').trim();
      i += 1;
      continue;
    }

    if (arg.startsWith('--voice=')) {
      const voice = arg.slice('--voice='.length).trim();
      options.voice = voice || undefined;
      continue;
    }

    if (arg === '--voice') {
      const voice = (argv[i + 1] || '').trim();
      options.voice = voice || undefined;
      i += 1;
      continue;
    }

    if (arg.startsWith('--speed=')) {
      options.speed = Number(arg.slice('--speed='.length));
      continue;
    }

    if (arg === '--speed') {
      options.speed = Number(argv[i + 1]);
      i += 1;
      continue;
    }

    if (arg.startsWith('--lang=')) {
      const lang = arg.slice('--lang='.length).trim();
      options.lang = lang || 'uz';
      continue;
    }

    if (arg === '--lang') {
      const lang = (argv[i + 1] || '').trim();
      options.lang = lang || 'uz';
      i += 1;
      continue;
    }

    if (arg.startsWith('--output=')) {
      const output = arg.slice('--output='.length).trim();
      options.output = output || undefined;
      continue;
    }

    if (arg === '--output') {
      const output = (argv[i + 1] || '').trim();
      options.output = output || undefined;
      i += 1;
      continue;
    }
  }

  return options;
}

function printHelp() {
  console.log(`TextToVoice CLI

Usage:
  node index.js --text "Salom dunyo"
  node index.js --text "Salom" --voice "Microsoft Zira Desktop" --speed 1.1
  node index.js --text "Assalomu alaykum" --lang uz --output ./audio/salom.mp3

Options:
  --text    Required. Ovozga aylantiriladigan matn
  --voice   Optional. say kutubxonasi uchun voice nomi
  --speed   Optional. O'qish tezligi (default: 1)
  --lang    Optional. gTTS tili (default: uz)
  --output  Optional. Berilsa MP3 fayl saqlanadi (gTTS ishlatiladi)
  --help    Yordam ma'lumoti
`);
}

function isSystemTtsAvailable() {
  if (process.platform !== 'linux') {
    return true;
  }

  const check = spawnSync('sh', ['-c', 'command -v festival >/dev/null 2>&1 || command -v espeak >/dev/null 2>&1']);
  return check.status === 0;
}

function speakWithSay(text, voice, speed) {
  return new Promise((resolve, reject) => {
    say.speak(text, voice, speed, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

function saveWithGTTS(text, lang, output) {
  return new Promise((resolve, reject) => {
    const outputPath = path.resolve(output);
    const outputDir = path.dirname(outputPath);

    fs.mkdirSync(outputDir, { recursive: true });

    const tts = new gTTS(text, lang);
    tts.save(outputPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(outputPath);
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  if (!args.text) {
    console.error('Xatolik: --text argumenti majburiy. --help ni ko\'ring.');
    process.exitCode = 1;
    return;
  }

  if (!Number.isFinite(args.speed) || args.speed <= 0) {
    console.error('Xatolik: --speed musbat son bo\'lishi kerak.');
    process.exitCode = 1;
    return;
  }

  if (args.output) {
    try {
      const outputPath = await saveWithGTTS(args.text, args.lang, args.output);
      console.log(`MP3 saqlandi: ${outputPath}`);
      return;
    } catch (err) {
      console.error('gTTS bilan MP3 yaratishda xatolik:', err.message || err);
      process.exitCode = 1;
      return;
    }
  }

  if (!isSystemTtsAvailable()) {
    console.error('Tizim TTS engine topilmadi (festival/espeak).');
    console.error('Yechim: festival/espeak o\'rnating yoki --output bilan MP3 yarating.');
    console.error('Misol: node index.js --text "Salom" --lang uz --output ./audio/salom.mp3');
    process.exitCode = 1;
    return;
  }

  try {
    await speakWithSay(args.text, args.voice, args.speed);
    console.log('Matn eshittirildi.');
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    console.error('Matnni eshittirishda xatolik:', message);
    process.exitCode = 1;
  }
}

main();
