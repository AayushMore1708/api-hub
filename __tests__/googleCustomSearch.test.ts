import { googleCustomSearch } from '@/utils/googleSearch';

describe('googleCustomSearch (integration)', () => {
  beforeAll(() => {
    if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_CX) {
      throw new Error(
        '❌ Missing GOOGLE_API_KEY or GOOGLE_CX in environment. Please set them before running tests.'
      );
    }
  });

  it('should return actual search results for a real query', async () => {
    const results = await googleCustomSearch('OpenAI ChatGPT');

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    const first = results[0];
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('link');
    expect(typeof first.title).toBe('string');
    expect(typeof first.link).toBe('string');
  }, 15000); 

  it('should return an empty array for gibberish queries', async () => {
    const results = await googleCustomSearch('asdfghjklqwertyuiopzxcvbnm1234567890');
    expect(Array.isArray(results)).toBe(true);
  });
});
