import axios from "axios";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

export async function googleCustomSearch(query: string) {
  // Validate environment variables
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    console.error('❌ Missing Google Search credentials');
    console.error('GOOGLE_API_KEY:', GOOGLE_API_KEY ? '✓ Set' : '✗ Missing');
    console.error('GOOGLE_CX:', GOOGLE_CX ? '✓ Set' : '✗ Missing');
    throw new Error('Google Search API credentials not configured. Please set GOOGLE_API_KEY and GOOGLE_CX environment variables.');
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1`;
    const params = {
      key: GOOGLE_API_KEY,
      cx: GOOGLE_CX,
      q: query,
      num: 10, // Number of results
    };
    
    console.log('🔍 Google Search query:', query);
    const response = await axios.get(url, { params });
    
    if (!response.data.items || response.data.items.length === 0) {
      console.log('⚠️ No search results found');
      return [];
    }
    
    console.log('✅ Found', response.data.items.length, 'search results');
    return response.data.items; // Array of search results
  } catch (error: any) {
    console.error('❌ Google Search API error:', error.response?.data || error.message);
    
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