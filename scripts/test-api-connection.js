#!/usr/bin/env node

/**
 * Script para probar la conectividad con el servidor API local
 * Uso: node scripts/test-api-connection.js
 */

const https = require('https');
const http = require('http');

const API_BASE_URL = 'http://10.0.2.2:8000';
const API_ENDPOINTS = {
  health: '/api/health',
  login: '/api/auth/login',
  register: '/api/auth/register',
  gym_week: '/api/gym/my-week',
  gym_day: '/api/gym/my-day',
};

console.log('🔍 Testing API Connection to:', API_BASE_URL);
console.log('='.repeat(50));

async function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'VillaMitreApp-TestScript/1.0.0',
      },
      timeout: 5000,
    };

    if (body && method !== 'GET') {
      const bodyString = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyString);
    }

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          data: data,
          contentType: res.headers['content-type'] || 'unknown',
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body && method !== 'GET') {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function testServerHealth() {
  console.log('\n🏥 Testing Server Health...');

  try {
    const response = await testEndpoint(API_ENDPOINTS.health);
    console.log(`✅ Health Check: ${response.status} ${response.statusText}`);
    console.log(`📋 Content-Type: ${response.contentType}`);

    if (response.data) {
      try {
        const healthData = JSON.parse(response.data);
        console.log('📊 Health Data:', JSON.stringify(healthData, null, 2));
      } catch (e) {
        console.log('📄 Raw Response:', response.data.substring(0, 200));
      }
    }

    return true;
  } catch (error) {
    console.log(`❌ Health Check Failed: ${error.message}`);
    return false;
  }
}

async function testAuthEndpoints() {
  console.log('\n🔐 Testing Authentication Endpoints...');

  // Test login endpoint
  try {
    const loginResponse = await testEndpoint(API_ENDPOINTS.login, 'POST', {
      dni: 'test',
      password: 'test',
    });

    console.log(`📝 Login Test: ${loginResponse.status} ${loginResponse.statusText}`);
    console.log(`📋 Content-Type: ${loginResponse.contentType}`);

    if (loginResponse.status === 422) {
      console.log('✅ Login endpoint responding (validation error expected)');
    } else if (loginResponse.status === 401) {
      console.log('✅ Login endpoint responding (auth error expected)');
    } else {
      console.log('⚠️  Unexpected login response status');
    }
  } catch (error) {
    console.log(`❌ Login Test Failed: ${error.message}`);
  }

  // Test register endpoint
  try {
    const registerResponse = await testEndpoint(API_ENDPOINTS.register, 'POST', {
      dni: 'test',
      name: 'Test User',
      email: 'test@test.com',
      password: 'test123',
    });

    console.log(`📝 Register Test: ${registerResponse.status} ${registerResponse.statusText}`);

    if (registerResponse.status === 422) {
      console.log('✅ Register endpoint responding (validation error expected)');
    } else {
      console.log('⚠️  Unexpected register response status');
    }
  } catch (error) {
    console.log(`❌ Register Test Failed: ${error.message}`);
  }
}

async function testGymEndpoints() {
  console.log('\n🏋️ Testing Gym Endpoints...');

  // Test gym endpoints (these require auth, so we expect 401)
  const gymEndpoints = [
    { path: API_ENDPOINTS.gym_week, name: 'Weekly Plan' },
    { path: API_ENDPOINTS.gym_day, name: 'Daily Workout' },
  ];

  for (const endpoint of gymEndpoints) {
    try {
      const response = await testEndpoint(endpoint.path);
      console.log(`🏋️ ${endpoint.name}: ${response.status} ${response.statusText}`);

      if (response.status === 401) {
        console.log(`✅ ${endpoint.name} endpoint responding (auth required)`);
      } else if (response.status === 404) {
        console.log(`⚠️  ${endpoint.name} endpoint not found`);
      } else {
        console.log(`⚠️  Unexpected ${endpoint.name} response status`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name} Test Failed: ${error.message}`);
    }
  }
}

async function testBasicConnectivity() {
  console.log('\n🌐 Testing Basic Connectivity...');

  try {
    const response = await testEndpoint('/');
    console.log(`🏠 Root Path: ${response.status} ${response.statusText}`);
    console.log(`📋 Content-Type: ${response.contentType}`);

    if (response.status === 200) {
      console.log('✅ Server is responding');
    } else {
      console.log('⚠️  Server responding with non-200 status');
    }

    return true;
  } catch (error) {
    console.log(`❌ Basic Connectivity Failed: ${error.message}`);

    if (error.code === 'ECONNREFUSED') {
      console.log('🚨 CONNECTION REFUSED - Server might not be running');
      console.log('💡 Make sure to start the server with: php artisan serve');
    } else if (error.code === 'ENOTFOUND') {
      console.log('🚨 HOST NOT FOUND - DNS resolution failed');
    } else if (error.message.includes('timeout')) {
      console.log('🚨 REQUEST TIMEOUT - Server not responding');
    }

    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Connection Tests...');
  console.log(`🎯 Target: ${API_BASE_URL}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

  const basicConnectivity = await testBasicConnectivity();

  if (basicConnectivity) {
    await testServerHealth();
    await testAuthEndpoints();
    await testGymEndpoints();
  } else {
    console.log('\n❌ Skipping detailed tests due to basic connectivity failure');
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 API Connection Tests Complete');

  if (basicConnectivity) {
    console.log('✅ Server is reachable - App should be able to connect');
  } else {
    console.log('❌ Server is not reachable - Check server status');
    console.log('💡 Troubleshooting steps:');
    console.log('   1. Start Laravel server: php artisan serve');
    console.log('   2. Check server is running on port 8000');
    console.log('   3. Verify no firewall blocking connections');
    console.log('   4. Test manually: curl http://localhost:8000');
  }
}

// Run the tests
runAllTests().catch(console.error);
