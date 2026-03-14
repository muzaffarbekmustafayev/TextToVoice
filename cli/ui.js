const C = require('./colors');

function printHelp() {
  console.log(`
${C.bold}${C.cyan}╔══════════════════════════════════════════════════════════╗
║          🔊 TextToVoice — Uzbek TTS CLI                  ║
╚══════════════════════════════════════════════════════════╝${C.reset}

${C.bold}${C.white}ISHLATISH:${C.reset}
  ${C.green}node index.js${C.reset} ${C.yellow}--text${C.reset} "Matn" [parametrlar]

${C.bold}${C.white}MISOLLAR:${C.reset}
  ${C.green}node index.js${C.reset} ${C.yellow}-t${C.reset} "Assalomu alaykum" ${C.yellow}-e${C.reset} gtts ${C.yellow}-o${C.reset} salom.mp3
  ${C.green}node index.js${C.reset} ${C.yellow}-t${C.reset} "Salom dunyo" ${C.yellow}-e${C.reset} openai ${C.yellow}-o${C.reset} salom.mp3
  ${C.green}node index.js${C.reset} ${C.yellow}-t${C.reset} "Salom" ${C.yellow}-e${C.reset} openai ${C.yellow}-a${C.reset} toshkent ${C.yellow}-o${C.reset} salom.mp3
  ${C.green}node index.js${C.reset} ${C.yellow}--info${C.reset}

${C.bold}${C.white}PARAMETRLAR:${C.reset}
  ${C.yellow}--text, -t${C.reset}      Ovozga aylantiriladigan matn (majburiy)
  ${C.yellow}--engine, -e${C.reset}    TTS engine: openai | gtts | say | coqui (default: gtts)
  ${C.yellow}--voice, -v${C.reset}     Ovoz turi
  ${C.yellow}--speed, -s${C.reset}     O'qish tezligi (default: 1)
  ${C.yellow}--accent, -a${C.reset}    Aksent: uzbek | toshkent | samarqand | formal | kitob
  ${C.yellow}--output, -o${C.reset}    MP3 fayl yo'li
  ${C.yellow}--lang${C.reset}          gTTS tili (default: uz)
  ${C.yellow}--model${C.reset}         OpenAI model (default: gpt-4o-mini-tts)
  ${C.yellow}--url${C.reset}           Coqui API URL (default: http://localhost:8000/tts)
  ${C.yellow}--pause${C.reset}         Gaplar orasidagi pauza ms (default: 150)
  ${C.yellow}--no-normalize${C.reset}  Matn normalizatsiyasini o'chirish
  ${C.yellow}--info${C.reset}          Engine'lar haqida ma'lumot
  ${C.yellow}--help, -h${C.reset}      Yordam
`);
}

function printEngineInfo(engines) {
  console.log(`\n${C.bold}${C.cyan}🔊 Mavjud TTS Engine'lar:${C.reset}\n`);

  for (const [name, engine] of Object.entries(engines)) {
    const i = engine.info();
    console.log(`${C.bold}${C.green}  ▸ ${i.name}${C.reset}`);
    console.log(`    ${C.dim}${i.description}${C.reset}`);
    console.log(`    ${C.dim}Sifat: ${i.quality}${C.reset}`);

    if (i.available !== undefined) {
      const status = i.available
        ? `${C.green}✅ Tayyor${C.reset}`
        : `${C.red}❌ Mavjud emas${C.reset}`;
      console.log(`    Holat: ${status}`);
    }
    if (i.voices)   console.log(`    ${C.dim}Ovozlar: ${i.voices.join(', ')}${C.reset}`);
    if (i.accents)  console.log(`    ${C.magenta}Aksentlar: ${i.accents.join(', ')}${C.reset}`);
    if (i.note)     console.log(`    ${C.yellow}${i.note}${C.reset}`);
    console.log();
  }
}

function showProgress(current, total, label) {
  const width   = 30;
  const filled  = Math.round((current / total) * width);
  const percent = Math.round((current / total) * 100);
  const bar     = '█'.repeat(filled) + '░'.repeat(width - filled);

  process.stdout.write(
    `\r  ${C.cyan}${bar}${C.reset} ${percent}% ${C.dim}${label}${C.reset}`
  );
  if (current === total) process.stdout.write('\n');
}

module.exports = { printHelp, printEngineInfo, showProgress };
