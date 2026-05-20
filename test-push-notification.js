/**
 * Test Push Notifications Locally
 * 
 * Usage:
 * 1. Start your server: npm run dev
 * 2. Run this script: node test-push-notification.js
 */

const testToken = 'PASTE_YOUR_FCM_TOKEN_HERE';
const baseUrl = 'http://localhost:3000/api/v1';

async function testPushNotifications() {
  console.log('🧪 Testing Push Notifications...\n');

  try {
    // Step 1: Register (or login) to get auth token
    console.log('1️⃣ Logging in...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123'
      })
    });
    const { token: authToken, user } = await loginRes.json();
    console.log(`✅ Logged in as: ${user.name} (${user.id})\n`);

    // Step 2: Register push token
    console.log('2️⃣ Registering push token...');
    const registerRes = await fetch(`${baseUrl}/push-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ token: testToken })
    });
    const registerData = await registerRes.json();
    console.log(`✅ Token registered: ${registerData.message}\n`);

    // Step 3: Send test notification directly
    console.log('3️⃣ Sending test notification...');
    const testRes = await fetch(`${baseUrl}/push-tokens/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    const testData = await testRes.json();
    console.log(`✅ Notification sent: ${testData.message}\n`);

    console.log('✨ All tests passed! Check your device for notification.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPushNotifications();
