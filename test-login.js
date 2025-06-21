// Test script to check if the backend fix works
const fetch = require('node-fetch');

const testLogin = async () => {
  try {
    console.log('Testing login endpoint...');
    
    const response = await fetch('https://sistema-vacunacion-backend.onrender.com/api/login/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test123'
      })
    });

    const responseText = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', responseText);

    if (response.status === 500) {
      console.log('\n❌ Still getting 500 error. The backend changes need to be deployed.');
    } else if (response.status === 401) {
      console.log('\n✅ Good! The 500 error is fixed. Now getting 401 (invalid credentials) which is expected for test credentials.');
    } else if (response.status === 200) {
      console.log('\n✅ Perfect! Login successful.');
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testLogin();
