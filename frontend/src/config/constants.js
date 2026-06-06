export const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Korean', 'Chinese', 'Arabic', 'Russian', 'Hindi',
  'Dutch', 'Swedish', 'Turkish', 'Polish', 'Vietnamese', 'Thai'
];

export const getLangCode = (languageName) => {
  const map = {
    'English': 'en-US', 'Spanish': 'es-ES', 'French': 'fr-FR', 'German': 'de-DE', 'Italian': 'it-IT', 'Portuguese': 'pt-BR',
    'Japanese': 'ja-JP', 'Korean': 'ko-KR', 'Chinese': 'zh-CN', 'Arabic': 'ar-SA', 'Russian': 'ru-RU', 'Hindi': 'hi-IN',
    'Dutch': 'nl-NL', 'Swedish': 'sv-SE', 'Turkish': 'tr-TR', 'Polish': 'pl-PL', 'Vietnamese': 'vi-VN', 'Thai': 'th-TH'
  };
  return map[languageName] || 'en-US';
};

export const COUNTRIES = [
  'Argentina', 'Australia', 'Brazil', 'Canada', 'China', 'France',
  'Germany', 'India', 'Italy', 'Japan', 'Mexico', 'Russia',
  'South Korea', 'Spain', 'United Kingdom', 'United States'
];
