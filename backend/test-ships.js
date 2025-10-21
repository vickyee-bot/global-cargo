import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// First, let's login to get a token
async function login() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    if (data.token) {
      console.log('✅ Login successful');
      return data.token;
    } else {
      console.log('❌ Login failed:', data);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

// Test getting all ships
async function testGetShips(token) {
  try {
    const response = await fetch(`${API_BASE}/ships`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    const data = await response.json();
    console.log('📋 Ships Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.log('❌ Error fetching ships:', error.message);
  }
}

// Test creating a new ship
async function testCreateShip(token) {
  try {
    const newShip = {
      name: 'Test Ship Alpha',
      registration_number: 'TEST-001',
      capacity_in_tonnes: 5000,
      type: 'cargo_ship',
      status: 'active'
    };
    
    const response = await fetch(`${API_BASE}/ships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newShip)
    });
    
    const data = await response.json();
    console.log('🚢 Create Ship Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.log('❌ Error creating ship:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting Ship API Tests...\n');
  
  const token = await login();
  if (!token) {
    console.log('Cannot proceed without authentication token');
    return;
  }
  
  console.log('\n1. Testing GET /ships');
  await testGetShips(token);
  
  console.log('\n2. Testing POST /ships');
  await testCreateShip(token);
  
  console.log('\n3. Testing GET /ships after creation');
  await testGetShips(token);
  
  console.log('\n✅ Tests completed');
}

runTests().catch(console.error);