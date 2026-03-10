#!/usr/bin/env node

/**
 * Backend Initialization Script
 * This script checks all prerequisites and initializes the backend
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔧 Backend Initialization Check\n');
console.log('='.repeat(50));

let hasErrors = false;

// Check 1: .env file
console.log('\n1️⃣  Checking .env file...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('   ✅ .env file exists');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    if (envContent.includes('MONGODB_URI') && envContent.includes('JWT_SECRET')) {
        console.log('   ✅ MONGODB_URI and JWT_SECRET are configured');
    } else {
        console.log('   ⚠️  Missing required environment variables');
        hasErrors = true;
    }
} else {
    console.log('   ❌ .env file not found!');
    console.log('   Create .env file with:');
    console.log('      MONGODB_URI=mongodb://localhost:27017/restaurant_management');
    console.log('      JWT_SECRET=your_secret_key');
    console.log('      PORT=5000');
    hasErrors = true;
}

// Check 2: node_modules
console.log('\n2️⃣  Checking dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    console.log('   ✅ node_modules exists');
} else {
    console.log('   ❌ node_modules not found!');
    console.log('   Run: npm install');
    hasErrors = true;
}

// Check 3: Required directories
console.log('\n3️⃣  Checking directory structure...');
const requiredDirs = [
    'config',
    'controllers',
    'middleware',
    'models',
    'routes',
    'seeds'
];

let allDirsExist = true;
for (const dir of requiredDirs) {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
        console.log(`   ✅ ${dir}/`);
    } else {
        console.log(`   ❌ ${dir}/ not found`);
        allDirsExist = false;
    }
}

if (!allDirsExist) {
    hasErrors = true;
}

// Check 4: Key files
console.log('\n4️⃣  Checking key files...');
const requiredFiles = [
    'server.js',
    'config/db.js',
    'seeds/seedDatabase.js',
    'middleware/auth.js',
    'models/Order.js',
    'models/MenuItem.js',
    'models/User.js',
];

for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ ${file} not found`);
        hasErrors = true;
    }
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.log('\n⚠️  Some issues were found. Please fix them before running the server.\n');
    process.exit(1);
} else {
    console.log('\n✅ All checks passed! Backend is ready.\n');
    console.log('Next steps:');
    console.log('1. Make sure MongoDB is running (run: start-mongodb.bat)');
    console.log('2. Start the server:');
    console.log('   npm run dev\n');
    process.exit(0);
}
