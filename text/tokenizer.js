/**
 * Uzbek Text Tokenizer Module
 * ============================
 * Matnni gaplarga bo'lib beradi.
 * TTS engine'lar uzun matnni yomon o'qiydi,
 * shuning uchun matnni kichik qismlarga bo'lish kerak.
 */

/**
 * Matnni gaplarga ajratadi (.!? belgilari bo'yicha)
 *
 * Masalan:
 *   "Salom dunyo. Qalaysiz?" → ["Salom dunyo.", "Qalaysiz?"]
 *   "Men kelaman! Siz-chi?" → ["Men kelaman!", "Siz-chi?"]
 *
 * @param {string} text — bo'linadigan matn
 * @returns {string[]} — gaplar ro'yxati
 */
function splitIntoSentences(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  return text
    .split(/([.!?]+)/)
    .reduce((acc, part, i, arr) => {
      // Tinish belgisi bo'lsa, oldingi gap oxiriga qo'shamiz
      if (/^[.!?]+$/.test(part) && acc.length > 0) {
        acc[acc.length - 1] += part;
      } else if (part.trim()) {
        acc.push(part.trim());
      }
      return acc;
    }, []);
}

/**
 * Matnni optimal uzunlikdagi bo'laklarga ajratadi
 * Har bir bo'lak maxChars dan oshmasligi kerak
 *
 * Uzun gaplarni vergul (,), nuqta-vergul (;), tire (-) bo'yicha bo'ladi
 *
 * @param {string} text — bo'linadigan matn
 * @param {number} maxChars — har bir bo'lak uchun maksimal belgilar soni (default: 200)
 * @returns {string[]} — bo'laklar ro'yxati
 */
function splitIntoChunks(text, maxChars = 200) {
  const sentences = splitIntoSentences(text);
  const chunks = [];

  for (const sentence of sentences) {
    if (sentence.length <= maxChars) {
      chunks.push(sentence);
      continue;
    }

    // Uzun gapni kichikroq qismlarga bo'lish
    const subParts = sentence.split(/([,;])\s*/);
    let current = '';

    for (let j = 0; j < subParts.length; j++) {
      const part = subParts[j];

      if (/^[,;]$/.test(part)) {
        current += part;
        continue;
      }

      if ((current + ' ' + part).trim().length > maxChars && current.trim()) {
        chunks.push(current.trim());
        current = part;
      } else {
        current = current ? current + ' ' + part : part;
      }
    }

    if (current.trim()) {
      chunks.push(current.trim());
    }
  }

  return chunks;
}

module.exports = {
  splitIntoSentences,
  splitIntoChunks,
};
