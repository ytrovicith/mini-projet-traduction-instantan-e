import axios from 'axios';
import headersApi from './headersApi';

/**
 * Fetches the list of supported languages from the API.
 * @returns {Promise<Array|Error>} - A promise that resolves to an array of languages or an error object.
 */
export default getLanguages = async () => {
  const options = {
    method: 'GET',
    url: `${headersApi.BASE_URL}/languages`,
    headers: headersApi.headers,
  };

  try {
    const response = await axios(options);
    const languages = response.data?.data?.languages;
    if (languages && languages.length > 0) {
      return languages;
    }
    throw new Error('No languages data received from API.');
  } catch (error) {
/*     console.error('Failed to fetch languages:', error); */
    throw error; 
  }
};