import axios from "axios";

export async function googleCustomSearch(query: string) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const GOOGLE_CX = process.env.GOOGLE_CX;

  try {
    const url = `https://www.googleapis.com/customsearch/v1`;
    const params = {
      key: GOOGLE_API_KEY,
      cx: GOOGLE_CX,
      q: query,
      num: 10,
    };
    
    const response = await axios.get(url, { params });
    
    if (!response.data.items || response.data.items.length === 0) {
      return [];
    }
    
    return response.data.items;
  } catch (error: any) {
    if (error.response?.status === 429) {
      throw new Error('Google Search API rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 403) {
      throw new Error('Google Search API access denied. Please check your API key and Search Engine ID.');
    } else if (error.response?.status === 400) {
      throw new Error('Invalid search query or API configuration.');
    }
    
    throw error;
  }
}