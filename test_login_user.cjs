const axios = require('axios');

async function testLogin() {
  const baseUrl = 'http://localhost:5000/api/v1';
  try {
    console.log('Testing login for shivam06singh12314@gmail.com...');
    const res = await axios.post(`${baseUrl}/auth/login`, {
      email: 'shivam06singh12314@gmail.com',
      password: 'password123' // I'm guessing the password from my test script earlier
    });
    console.log('Login success!');
  } catch (error) {
    console.error('Login failed!');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
  }
}

testLogin();
