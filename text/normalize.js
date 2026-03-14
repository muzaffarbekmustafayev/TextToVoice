/**
 * Uzbek Text Normalization Module (SOF O'ZBEK TILI)
 * ===============================================
 * Aksentsiz va tutulishlarsiz o'qish uchun optimallashtirilgan.
 */

/**
 * Unicode normalizatsiyasi
 */
function normalizeUzbekText(text) {
  if (!text) return '';
  return text
    .replace(/o'/g, 'oʻ')
    .replace(/g'/g, 'gʻ')
    .replace(/O'/g, 'Oʻ')
    .replace(/G'/g, 'Gʻ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * gTTS (Turk engine fallback) uchun fonetik mapping.
 * FAQAT motor tanimaydigan belgilarni o'zgartiramiz.
 * So'zlarning o'zini o'zgartirmaymiz (aksentni yo'qotish uchun).
 */
function mapToTurkish(text) {
  if (!text) return '';
  
  return text
    // 1. Birikmalarni bitta belgi bilan almashtirish (tutulishni yo'qotadi)
    .replace(/sh/gi, 'ş')
    .replace(/ch/gi, 'ç')
    
    // 2. O'zbek harflarini turkcha ekvivalentlariga (faqat fonetika uchun)
    .replace(/gʻ/gi, 'ğ')
    .replace(/oʻ/gi, 'ö')
    
    // 3. X va Q harflari (Turk tilida bu harflar yo'q, h va k eng yaqini)
    .replace(/x/gi, 'h')
    .replace(/q/gi, 'k')
    
    // 4. Tutuq belgisi (') - turk engine buni tushunmaydi, pauza beradi
    .replace(/ʼ/g, '')
    .replace(/'/g, '');
}

/**
 * Raqamlarni so'zlarga aylantirish
 */
function numbersToWords(text) {
  const numbers = {
    '10': 'o\'n', '0': 'nol', '1': 'bir', '2': 'ikki', '3': 'uch',
    '4': 'to\'rt', '5': 'besh', '6': 'olti', '7': 'yetti', '8': 'sakkiz', '9': 'to\'qqiz'
  };
  let result = text;
  // Avval 10 ni tekshiramiz (uzunroq bo'lgani uchun)
  for (const [num, word] of Object.entries(numbers)) {
    result = result.replace(new RegExp(`\\b${num}\\b`, 'g'), word);
  }
  return result;
}

/**
 * Umumiy Pipeline (OpenAI va Say uchun)
 */
function processText(text) {
  let result = text;
  result = normalizeUzbekText(result);
  result = numbersToWords(result);
  return result;
}

/**
 * gTTS uchun Pipeline (Aksent kamaytirilgan)
 */
function processTextForTurkish(text) {
  let result = text;
  result = normalizeUzbekText(result);
  result = numbersToWords(result);
  result = mapToTurkish(result);
  return result;
}

module.exports = {
  normalizeUzbekText,
  mapToTurkish,
  numbersToWords,
  processText,
  processTextForTurkish,
};
