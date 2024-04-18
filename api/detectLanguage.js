import axios from 'axios';
import headersApi from './headersApi';

/**
 * Detects the language of the provided text using the API.
 * @param {string} text - The text to detect the language for.
 * @returns {Promise<string|Error>} - A promise that resolves to the detected language or an error object.
 */
export default detectLanguage = async (text) => {
  const encodedParams = new URLSearchParams();
  encodedParams.append('q', text);

  const options = {
    method: 'POST',
    url: `${headersApi.BASE_URL}/detect`,
    headers: headersApi.headers,
    data: encodedParams,
  };

  try {
    const response = await axios(options);
    const detections = response.data?.data?.detections;
    if (detections && detections.length > 0) {
      return detections[0][0].language;
    }
    throw new Error('No language detection data received from API.');
  } catch (error) {
/*     console.error('Language detection failed:', error); */
    throw error; 
  }
};