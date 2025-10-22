describe('Profile API Integration Tests', () => {
  const baseURL = process.env.TEST_API_URL || 'http://localhost:3000';

  beforeAll(() => {
    console.log('Make sure dev server is running: npm run dev');
  });

  it('should return default avatar when no session', async () => {
    const response = await fetch(`${baseURL}/api/profile`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    console.log("Data is " +data.image);
    expect(data.image).toBe('/default-avatar.png');
  });
});