#!/usr/bin/env node

/**
 * API Tester Script
 * Tests basic API endpoints to verify backend is working
 */

import axios from 'axios';
import readline from 'readline';

const BASE_URL = 'http://localhost:5000/api';
let authToken = null;
let testUser = {
    id: null,
    email: null
};

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function testHealthCheck() {
    try {
        console.log('\n🏥 Testing Health Check...');
        const response = await api.get('/health');
        console.log('✅ Health Check:', response.data.message);
        return true;
    } catch (error) {
        console.error('❌ Health Check Failed:', error.response?.data?.message || error.message);
        return false;
    }
}

async function testDBStatus() {
    try {
        console.log('\n💾 Testing Database Status...');
        const response = await api.get('/db-status');
        console.log('Status:', response.data.message);
        if (response.data.connected) {
            console.log('✅ MongoDB Connected');
            return true;
        } else {
            console.log('❌ MongoDB Not Connected');
            console.log('Hint:', response.data.hint);
            return false;
        }
    } catch (error) {
        console.error('❌ Unable to check database status:', error.message);
        return false;
    }
}

async function testSignup() {
    try {
        console.log('\n👤 Testing Signup...');
        const email = `testuser${Date.now()}@test.com`;
        const response = await api.post('/auth/signup', {
            name: 'Test User',
            email: email,
            password: 'testpass123',
            role: 'customer'
        });
        authToken = response.data.token;
        testUser.id = response.data.user.id;
        testUser.email = response.data.user.email;
        console.log('✅ Signup successful');
        console.log('   Email:', email);
        console.log('   Token:', authToken.substring(0, 20) + '...');
        return true;
    } catch (error) {
        console.error('❌ Signup failed:', error.response?.data?.message || error.message);
        return false;
    }
}

async function testMenuItems() {
    try {
        console.log('\n📋 Testing Get Menu Items...');
        const response = await api.get('/menu');
        console.log('✅ Menu loaded:', response.data.length, 'items');
        response.data.slice(0, 3).forEach(item => {
            console.log(`   - ${item.name} ($${item.price})`);
        });
        return response.data;
    } catch (error) {
        console.error('❌ Get menu failed:', error.response?.data?.message || error.message);
        return null;
    }
}

async function testCreateOrder(menuItems) {
    try {
        console.log('\n📦 Testing Create Order...');
        if (!authToken) {
            console.log('⚠️  You need to sign up first');
            return false;
        }
        if (!menuItems || menuItems.length === 0) {
            console.log('⚠️  No menu items available');
            return false;
        }

        const item = menuItems[0];
        const response = await api.post('/orders', {
            tableNumber: 5,
            items: [{
                menuItemId: item._id,
                name: item.name,
                price: item.price,
                quantity: 2
            }],
            specialInstructions: 'No onions'
        });

        console.log('✅ Order created successfully');
        console.log('   Order ID:', response.data.order._id);
        console.log('   Confirmation Code:', response.data.confirmationCode);
        console.log('   Total:', '$' + response.data.order.totalAmount);
        return true;
    } catch (error) {
        console.error('❌ Create order failed:', error.response?.data?.message || error.message);
        if (error.response?.data?.details) {
            console.error('Details:', error.response.data.details);
        }
        return false;
    }
}

async function testGetYourOrders() {
    try {
        console.log('\n📋 Testing Get Your Orders...');
        if (!authToken) {
            console.log('⚠️  You need to sign up first');
            return false;
        }
        const response = await api.get('/orders/customer/orders');
        console.log('✅ Your orders:', response.data.length);
        response.data.slice(0, 2).forEach(order => {
            console.log(`   - Order #${order._id.substring(0, 8)}... Total: $${order.totalAmount}`);
        });
        return true;
    } catch (error) {
        console.error('❌ Get orders failed:', error.response?.data?.message || error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 API Tester - Running All Tests');
    console.log('='.repeat(50));

    let tests = [];

    // Test 1: Health Check
    tests.push(await testHealthCheck());

    // Test 2: Database Status
    const dbConnected = await testDBStatus();

    if (!dbConnected) {
        console.log('\n❌ Database not connected. Please start MongoDB and try again.');
        console.log('Run: start-mongodb.bat');
        rl.close();
        process.exit(1);
    }

    tests.push(dbConnected);

    // Test 3: Signup
    tests.push(await testSignup());

    // Test 4: Get Menu Items
    const menuItems = await testMenuItems();
    tests.push(menuItems !== null);

    // Test 5: Create Order
    if (menuItems) {
        tests.push(await testCreateOrder(menuItems));
    }

    // Test 6: Get Your Orders
    tests.push(await testGetYourOrders());

    // Summary
    console.log('\n' + '='.repeat(50));
    const passed = tests.filter(t => t).length;
    const total = tests.length;
    console.log(`\n📊 Test Results: ${passed}/${total} tests passed\n`);

    if (passed === total) {
        console.log('✅ All tests passed! Backend is working correctly.\n');
        process.exit(0);
    } else {
        console.log('⚠️  Some tests failed. Check the output above for details.\n');
        process.exit(1);
    }
}

async function main() {
    try {
        await runAllTests();
    } catch (error) {
        console.error('\n❌ Test runner error:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

console.log('\n🧪 Testing API Endpoints...');
console.log('Make sure backend is running on http://localhost:5000\n');

main();
