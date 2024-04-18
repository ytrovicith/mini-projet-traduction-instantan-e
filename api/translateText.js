import axios from 'axios';
import headersApi from './headersApi';
import he from 'he';

/**
 * Translates the provided text from the source language to the target language.
 * @param {string} text - The text to translate.
 * @param {string} sourceLanguage - The source language code.
 * @param {string} targetLanguage - The target language code.
 * @returns {Promise<string|Error>} - A promise that resolves to the translated text or an error object.
 */
export default translateText = async (text, sourceLanguage, targetLanguage) => {
  const params = new URLSearchParams();
  params.append('q', text);
  params.append('source', sourceLanguage);
  params.append('target', targetLanguage);

  const options = {
    method: 'POST',
    url: headersApi.BASE_URL,
    headers: headersApi.headers,
    data: params,
  };

  try {
    const response = await axios(options);
    const translations = response.data?.data?.translations;
    if (translations && translations.length > 0) {
      return he.decode(translations[0].translatedText);
    }
    throw new Error('No translation data received from API.');
  } catch (error) {
/*     console.error('Translation failed:', error); */
    throw error; 
  }
};
