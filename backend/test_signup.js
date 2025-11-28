const axios = require('axios');

const testSignup = async () => {
  try {
    const response = await axios.post('http://localhost:3001/auth/sign-up', {
      Name: 'Test',
      Surname: 'User',
      Username: 'testuser_' + Date.now(),
      Email: 'test_' + Date.now() + '@example.com',
      Password: 'password123',
      BirthDate: '1990-01-01',
      Sex: 'M',
      TargetWeight: 70,
      TargetCalorie: 2000,
      ActivityLevel: 'Moderate'
    });
    console.log('Signup successful:', response.data);
  } catch (error) {
    console.error('Signup failed:', error.response ? error.response.data : error.message);
  }
};

testSignup();
