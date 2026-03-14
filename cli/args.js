/**
 * CLI argumentlarini parse qilish
 */
function parseArgs(argv) {
  const options = {
    text:        '',
    voice:       undefined,
    speed:       1,
    lang:        'uz',
    output:      undefined,
    engine:      'gtts',
    model:       'gpt-4o-mini-tts',
    accent:      'uzbek',
    url:         undefined,
    pauseMs:     150,
    noNormalize: false,
    info:        false,
    help:        false,
  };

  const flagMap = {
    '--text':   'text',
    '--voice':  'voice',
    '--speed':  'speed',
    '--lang':   'lang',
    '--output': 'output',
    '--engine': 'engine',
    '--model':  'model',
    '--accent': 'accent',
    '--url':    'url',
    '--pause':  'pauseMs',
  };

  const shortMap = {
    '-t': 'text',
    '-o': 'output',
    '-e': 'engine',
    '-v': 'voice',
    '-s': 'speed',
    '-a': 'accent',
  };

  const numericKeys = new Set(['speed', 'pauseMs']);

  for (let i = 0; i < argv.length; i++) {
    const arg  = argv[i];
    const next = argv[i + 1];

    if (arg === '--help' || arg === '-h') { options.help = true; continue; }
    if (arg === '--info')                 { options.info = true; continue; }
    if (arg === '--no-normalize')         { options.noNormalize = true; continue; }

    // --key=value
    const eqIdx = arg.indexOf('=');
    if (eqIdx !== -1) {
      const flag = arg.slice(0, eqIdx);
      const key  = flagMap[flag];
      if (key) {
        const raw = arg.slice(eqIdx + 1).trim();
        options[key] = numericKeys.has(key) ? Number(raw) : raw;
        continue;
      }
    }

    // --key value
    const longKey = flagMap[arg];
    if (longKey && next && !next.startsWith('-')) {
      options[longKey] = numericKeys.has(longKey) ? Number(next) : next.trim();
      i++;
      continue;
    }

    // -k value
    const shortKey = shortMap[arg];
    if (shortKey && next) {
      options[shortKey] = numericKeys.has(shortKey) ? Number(next) : next.trim();
      i++;
    }
  }

  return options;
}

module.exports = { parseArgs };
