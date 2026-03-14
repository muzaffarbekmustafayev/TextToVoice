#!/usr/bin/env node

const fs = require('fs');
const { parseArgs }                        = require('./cli/args');
const { printHelp, printEngineInfo, showProgress } = require('./cli/ui');
const C                                    = require('./cli/colors');
const { processText }                      = require('./text/normalize');
const { splitIntoChunks }                  = require('./text/tokenizer');

const engines = {
  gtts:   require('./engine/gtts'),
  say:    require('./engine/say'),
  openai: require('./engine/openai'),
  coqui:  require('./engine/coqui'),
};

async function readStdin() {
  if (process.stdin.isTTY) return '';
  let data = '';
  for await (const chunk of process.stdin) data += chunk;
  return data.trim();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.text) args.text = await readStdin();
  if (args.help)  { printHelp(); return; }
  if (args.info)  { printEngineInfo(engines); return; }

  if (!args.text) {
    console.error(`\n${C.red}${C.bold}  ✖ Xatolik:${C.reset} --text (-t) argumenti majburiy.\n`);
    process.exitCode = 1;
    return;
  }

  const engineName = args.engine.toLowerCase();
  if (!engines[engineName]) {
    console.error(`\n${C.red}${C.bold}  ✖ Xatolik:${C.reset} Noma'lum engine: "${args.engine}"`);
    console.error(`  ${C.dim}Mavjud: ${Object.keys(engines).join(', ')}${C.reset}\n`);
    process.exitCode = 1;
    return;
  }

  if (!Number.isFinite(args.speed) || args.speed <= 0) {
    console.error(`\n${C.red}${C.bold}  ✖ Xatolik:${C.reset} --speed musbat son bo'lishi kerak.\n`);
    process.exitCode = 1;
    return;
  }

  const engine = engines[engineName];
  let text = args.noNormalize ? args.text : processText(args.text);
  const chunks = splitIntoChunks(text);

  console.log(`\n${C.bold}${C.cyan}  🔊 TextToVoice${C.reset}`);
  console.log(`  ${C.dim}${'─'.repeat(45)}${C.reset}`);
  console.log(`  ${C.green}✓${C.reset} ${C.dim}${chunks.length} ta bo'lakka ajratildi${C.reset}`);
  console.log(`  ${C.dim}Engine: ${C.bold}${engineName}${C.reset}`);
  if (args.voice)                  console.log(`  ${C.dim}Voice:  ${args.voice}${C.reset}`);
  if (engineName === 'openai')     console.log(`  ${C.dim}Aksent: ${C.magenta}${args.accent}${C.reset}`);
  if (args.output)                 console.log(`  ${C.dim}Output: ${args.output}${C.reset}`);
  console.log(`  ${C.dim}${'─'.repeat(45)}${C.reset}`);

  try {
    if (engineName === 'say') {
      for (let i = 0; i < chunks.length; i++) {
        showProgress(i + 1, chunks.length, `"${chunks[i].slice(0, 30)}..."`);
        await engine.synthesize(chunks[i], {
          voice: args.voice, speed: args.speed, pauseMs: args.pauseMs,
        });
      }
      console.log(`\n  ${C.green}${C.bold}✓ Matn muvaffaqiyatli eshittirildi!${C.reset}\n`);
      return;
    }

    if (!args.output) {
      console.error(`\n${C.red}${C.bold}  ✖ Xatolik:${C.reset} ${engineName} uchun --output (-o) majburiy.\n`);
      process.exitCode = 1;
      return;
    }

    showProgress(1, 2, 'Audio yaratilmoqda...');

    const outputPath = await engine.synthesize(chunks.join(' '), {
      lang:   args.lang,
      output: args.output,
      voice:  args.voice || (engineName === 'openai' ? 'alloy' : undefined),
      model:  args.model,
      speed:  args.speed,
      accent: args.accent,
      apiUrl: args.url,
    });

    showProgress(2, 2, 'Tayyor!');

    const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`\n  ${C.green}${C.bold}✓ MP3 saqlandi!${C.reset}`);
    console.log(`  ${C.dim}Fayl: ${outputPath}${C.reset}`);
    console.log(`  ${C.dim}Hajm: ${sizeKB} KB${C.reset}\n`);

  } catch (err) {
    console.error(`\n${C.red}${C.bold}  ✖ Xatolik:${C.reset} ${err.message || err}\n`);
    process.exitCode = 1;
  }
}

main();
