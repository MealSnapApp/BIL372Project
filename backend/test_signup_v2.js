const testSignup = async () => {
  try {
    const response = await fetch('http://localhost:3001/auth/sign-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
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
      })
    });

    if (response.ok) {
        const text = await response.text();
        console.log('Signup successful:', text);
    } else {
        const text = await response.text();
        console.log('Signup failed:', response.status, text);
    }
  } catch (error) {
    console.error('Signup error:', error.message);
  }
};

testSignup();
