// Simple Vercel Analytics API test script (No Teams)
// Run with: node test-vercel-simple.mjs

// Replace these with your actual values from Vercel dashboard
const VERCEL_ACCESS_TOKEN = '4vC9ApHlO0iBdurYOyJWi03h';
const VERCEL_PROJECT_ID = 'prj_5McECVyAg64ap8bceD8DxoYiAnJB';

console.log('🔍 Starting Vercel Analytics API test...\n');

// Check if credentials are set
if (VERCEL_ACCESS_TOKEN === 'your_access_token_here') {
  console.log('❌ ERROR: Please update VERCEL_ACCESS_TOKEN in the script');
  process.exit(1);
}

if (VERCEL_PROJECT_ID === 'your_project_id_here') {
  console.log('❌ ERROR: Please update VERCEL_PROJECT_ID in the script');
  process.exit(1);
}

console.log('✅ Credentials found');
console.log(`📋 Project ID: ${VERCEL_PROJECT_ID}`);
console.log(`🔑 Token: ${VERCEL_ACCESS_TOKEN.substring(0, 10)}...`);
console.log('');

async function testVercelAPI() {
  try {
    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const params = new URLSearchParams({
      projectId: VERCEL_PROJECT_ID,
      since: startDate.toISOString(),
      until: endDate.toISOString(),
    });

    const url = `https://api.vercel.com/v1/analytics/page-views?${params}`;
    
    console.log('🌐 Testing API connection...');
    console.log(`📅 Date range: ${startDate.toDateString()} to ${endDate.toDateString()}`);
    console.log(`🔗 URL: ${url}\n`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Vercel Analytics API is working');
      console.log('📊 Analytics data received:');
      console.log(JSON.stringify(data, null, 2));
      
      console.log('\n🎯 Next steps:');
      console.log('1. Add these credentials to your .env.local file:');
      console.log(`   VERCEL_ACCESS_TOKEN=${VERCEL_ACCESS_TOKEN}`);
      console.log(`   VERCEL_PROJECT_ID=${VERCEL_PROJECT_ID}`);
      console.log('2. Restart your Next.js app: npm run dev');
      console.log('3. Your analytics dashboard will now show real data!');
      
    } else {
      const errorText = await response.text();
      console.log('❌ API request failed');
      console.log(`Error details: ${errorText}`);
      
      console.log('\n🔧 Troubleshooting:');
      if (response.status === 401) {
        console.log('- Check your VERCEL_ACCESS_TOKEN is correct');
        console.log('- Make sure the token has analytics permissions');
      } else if (response.status === 403) {
        console.log('- Check your VERCEL_PROJECT_ID is correct');
        console.log('- Verify you have access to this project');
      } else if (response.status === 404) {
        console.log('- Verify your VERCEL_PROJECT_ID is correct');
        console.log('- Make sure analytics is enabled for your project');
      }
    }

  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log(error.message);
    
    console.log('\n🔧 Common issues:');
    console.log('- Make sure you have internet connection');
    console.log('- Check if you\'re using Node.js 18+ (for built-in fetch)');
    console.log('- Verify your credentials are correct');
  }
}

// Run the test
testVercelAPI().catch(console.error);

