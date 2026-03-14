# 🔊 TextToVoice — Uzbek TTS CLI

O'zbek tilidagi matnni ovozga aylantirish uchun Node.js CLI vositasi.

## Xususiyatlar

- **4 ta engine** — OpenAI, Google TTS, Coqui (local), tizim TTS (`espeak`/`festival`)
- **Matn normalizatsiyasi** — `o'` → `oʻ`, `g'` → `gʻ`, raqamlar → so'zlar
- **Aksent profillari** — `uzbek`, `toshkent`, `samarqand`, `formal`, `kitob` (OpenAI)
- **Smart tokenizer** — matnni gaplarga bo'lib, natural pauzalar bilan o'qish
- **Stdin qo'llab-quvvatlash** — pipe orqali matn uzatish

---

## O'rnatish

```bash
git clone <repo-url>
cd TextToVoice
npm install
```

**OpenAI engine uchun:**
```bash
npm install openai
export OPENAI_API_KEY="sk-..."
```

**Coqui engine uchun:**
```bash
pip install TTS          # Coqui TTS CLI
npm run server           # Node.js server ishga tushadi: http://localhost:8000
```

---

## Tezkor ishlatish

```bash
# Google TTS — bepul, API key shart emas
node index.js -t "Assalomu alaykum" -e gtts -o salom.mp3

# OpenAI TTS — eng yuqori sifat
node index.js -t "Salom dunyo" -e openai -o salom.mp3

# Aksent bilan
node index.js -t "Salom" -e openai -a toshkent -o salom.mp3

# Tizim TTS — jonli eshitish (fayl saqlanmaydi)
node index.js -t "Salom dunyo. Qalaysiz?" -e say

# Coqui — local server orqali
node index.js -t "Salom" -e coqui -o salom.mp3

# Stdin orqali
echo "Salom dunyo" | node index.js -e gtts -o salom.mp3

# Barcha engine'lar haqida ma'lumot
node index.js --info
```

---

## Parametrlar

| Parametr | Qisqa | Tavsif | Default |
|---|---|---|---|
| `--text` | `-t` | Ovozga aylantiriladigan matn | — |
| `--engine` | `-e` | TTS engine | `gtts` |
| `--output` | `-o` | Chiqish fayl yo'li (`.mp3`) | — |
| `--voice` | `-v` | Ovoz turi | `alloy` |
| `--speed` | `-s` | O'qish tezligi (`0.25`–`4.0`) | `1` |
| `--accent` | `-a` | Aksent profili (OpenAI) | `uzbek` |
| `--lang` | — | gTTS tili | `uz` |
| `--model` | — | OpenAI model | `gpt-4o-mini-tts` |
| `--url` | — | Coqui server manzili | `http://localhost:8000/tts` |
| `--pause` | — | Gaplar orasidagi pauza (ms) | `150` |
| `--no-normalize` | — | Normalizatsiyani o'chirish | — |
| `--info` | — | Engine'lar haqida ma'lumot | — |
| `--help` | `-h` | Yordam | — |

---

## Engine'lar

| Engine | Sifat | Narx | MP3 | Jonli |
|---|---|---|---|---|
| `openai` | ⭐⭐⭐⭐⭐ | Pullik | ✅ | ❌ |
| `coqui` | ⭐⭐⭐⭐⭐ | Bepul (local) | ✅ | ❌ |
| `gtts` | ⭐⭐ | Bepul | ✅ | ❌ |
| `say` | ⭐⭐ | Bepul | ❌ | ✅ |

### OpenAI aksent profillari

| Profil | Tavsif |
|---|---|
| `uzbek` | Standart o'zbek (default) |
| `toshkent` | Toshkent shahar aksenti |
| `samarqand` | Samarqand viloyat aksenti |
| `formal` | Rasmiy / yangiliklar uslubi |
| `kitob` | Audiobook uslubi |

---

## Loyiha strukturasi

```
TextToVoice/
├── cli/
│   ├── args.js       — CLI argumentlarini parse qilish
│   ├── colors.js     — Terminal rang kodlari
│   └── ui.js         — Help, progress bar, engine info
├── engine/
│   ├── openai.js     — OpenAI TTS
│   ├── gtts.js       — Google Translate TTS
│   ├── coqui.js      — Coqui TTS (local server client)
│   └── say.js        — Tizim TTS (espeak/festival)
├── text/
│   ├── normalize.js  — Matn normalizatsiyasi
│   └── tokenizer.js  — Gaplarga bo'lish
├── server.js         — Coqui TTS server (Express + Coqui CLI)
├── index.js          — CLI entry point
└── package.json
```

## Matn pipeline

```
input → normalize → numbersToWords → splitIntoChunks → TTS engine → audio
```

---

## Litsenziya

MIT
