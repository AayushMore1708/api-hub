import axios from "axios";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

export async function googleCustomSearch(query: string) {
  const url = `https://www.googleapis.com/customsearch/v1`;
  const params = {
    key: GOOGLE_API_KEY,
    cx: GOOGLE_CX,
    q: query,
  };
  const response = await axios.get(url, { params });
  return response.data.items; // Array of search results
}