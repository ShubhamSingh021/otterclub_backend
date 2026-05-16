const axios = require('axios');

async function testAuth() {
  const baseUrl = 'http://localhost:5000/api/v1';
  const email = `test_${Date.now()}@example.com`;
  
  try {
    console.log('1. Registering...');
    const regRes = await axios.post(`${baseUrl}/auth/register`, {
      name: 'Test User',
      email: email,
      password: 'password123'
    });
    const token = regRes.data.token;
    console.log('Register success, token length:', token.length);

    console.log('2. Logging in...');
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: email,
      password: 'password123'
    });
    const loginToken = loginRes.data.token;
    console.log('Login success, token length:', loginToken.length);

    console.log('3. Fetching profile with token...');
    const profileRes = await axios.get(`${baseUrl}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${loginToken}`
      }
    });
    console.log('Profile success:', profileRes.data.data.email);
    
  } catch (error) {
    console.error('Test failed!');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
  }
}

testAuth();
