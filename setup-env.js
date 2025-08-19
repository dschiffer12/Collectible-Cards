#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔐 Setting up environment variables for Collectible Scanner App\n');

// Check if .env already exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('   If you want to start fresh, delete the .env file and run this script again.\n');
  process.exit(0);
}

// Check if env.example exists
if (!fs.existsSync(envExamplePath)) {
  console.log('❌ env.example file not found!');
  console.log('   Please make sure env.example exists in the project root.\n');
  process.exit(1);
}

try {
  // Copy env.example to .env
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ Created .env file from env.example');
  console.log('📝 Please edit .env and add your actual API keys:\n');
  
  console.log('Required:');
  console.log('  - EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY (for card detection)');
  console.log('');
  console.log('Optional:');
  console.log('  - POKEMON_TCG_API_KEY (for enhanced Pokémon card data)');
  console.log('  - MARVEL_API_KEY (for Marvel card data)');
  console.log('');
  console.log('🔗 Get your API keys from:');
  console.log('  - Google Cloud Vision: https://console.cloud.google.com/');
  console.log('  - Pokémon TCG: https://dev.pokemontcg.io/');
  console.log('  - Marvel Comics: https://developer.marvel.com/');
  console.log('');
  console.log('⚠️  Remember: Never commit your .env file to version control!');
  
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}
