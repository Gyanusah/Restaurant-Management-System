// Test script to verify backend endpoints are working
import axios from 'axios';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

const testEndpoints = [
  { path: '/test', description: 'Main server test' },
  { path: '/api/menu/health', description: 'Menu health check' },
  { path: '/api/menu', description: 'Get all menu items' },
  { path: '/api/menu/categories', description: 'Get menu categories' },
  { path: '/api/menu/featured', description: 'Get featured items' },
];

async function runTests() {
  console.log('🧪 Testing Backend Endpoints...');
  console.log('Base URL:', BASE_URL);
  console.log('='.repeat(50));

  for (const endpoint of testEndpoints) {
    try {
      console.log(`\n📡 Testing: ${endpoint.path}`);
      console.log(`📝 Description: ${endpoint.description}`);

      const response = await axios.get(`${BASE_URL}${endpoint.path}`, {
        timeout: 5000
      });

      console.log(`✅ Status: ${response.status}`);
      console.log(`📄 Data:`, JSON.stringify(response.data, null, 2));

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`📊 Status: ${error.response.status}`);
        console.log(`📄 Response:`, error.response.data);
      }
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export default runTests;
