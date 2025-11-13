#!/usr/bin/env node

const localtunnel = require('localtunnel');

// Default port for Vite dev server
const PORT = process.env.PORT || 3000;

console.log('\n🚀 Starting tunnel to share your website...\n');
console.log(`📡 Connecting to localhost:${PORT}...\n`);

const tunnel = localtunnel(PORT, {
  subdomain: null, // Let localtunnel assign a random subdomain
}, (err, tunnel) => {
  if (err) {
    console.error('❌ Error creating tunnel:', err.message);
    console.log('\n💡 Make sure your development server is running first!');
    console.log('   Run: npm run dev\n');
    process.exit(1);
  }

  console.log('✅ Tunnel created successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 Share this URL with your client:');
  console.log(`   ${tunnel.url}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📝 Note: Keep this terminal open while sharing.');
  console.log('   Press Ctrl+C to stop sharing.\n');
});

tunnel.on('close', () => {
  console.log('\n🔒 Tunnel closed.');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Closing tunnel...');
  tunnel.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  tunnel.close();
  process.exit(0);
});

