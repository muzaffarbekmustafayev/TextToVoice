# TextToVoice

A simple Node.js Text-to-Speech CLI.

This project supports two modes:
- Speak text in real time (`say`)
- Generate an MP3 file from text (`gtts`)

## Requirements

- Node.js 18+
- npm

For real-time speech on Linux, you may need a system TTS engine:
- `festival` or `espeak`

If they are not installed, you can still generate MP3 files using `--output`.

## Installation

```bash
npm install
```

## Quick Start

Show help:

```bash
npm run help
```

Speak text:

```bash
npm start -- --text "Hello, world"
```

Speak with a specific voice and speed:

```bash
npm start -- --text "Test message" --voice "Microsoft Zira Desktop" --speed 1.1
```

Generate MP3:

```bash
npm start -- --text "Hello everyone" --lang en --output ./audio/hello.mp3
```

## CLI Arguments

- `--text` required. Text to convert to speech.
- `--voice` optional. Voice name for `say`.
- `--speed` optional. Speech rate (default: `1`).
- `--lang` optional. Language code for `gtts` (default: `uz`).
- `--output` optional. If provided, saves output as MP3.
- `--help` shows usage information.

## Troubleshooting

If you see `spawn festival ENOENT` or `spawn espeak ENOENT`:
1. Install `festival` or `espeak` on your system.
2. Or use MP3 mode:

```bash
npm start -- --text "Hello" --lang en --output ./audio/hello.mp3
```

## License

For personal/educational use.
