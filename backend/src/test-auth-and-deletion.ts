/**
 * Automated Verification Script:
 * 1. Cloudflare Turnstile Bot Defense on OTP Generation
 * 2. Google OAuth / GIS Registration & Sign-In
 * 3. Immutable Order Snapshot (customerName, customerEmail, customerPhone)
 * 4. 2-Step Customer Account Deletion & PII Anonymization
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:4000/api/v1';

async function runVerification() {
  console.log('🚀 Starting Verification: Auth, CAPTCHA, Snapshots & Account Deletion\n');

  // Test 1: Turnstile Bot Prevention (Should reject request without turnstileToken)
  console.log('--- TEST 1: Cloudflare Turnstile Bot Shield ---');
  const botRes = await fetch(`${API_URL}/customer/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testpatron@sutradara.in' }), // Missing turnstileToken
  });
  const botData = (await botRes.json()) as any;
  console.log(`Bot OTP Request (No Captcha): Status ${botRes.status}`, botData);
  if (botRes.status === 400 && botData.code === 'CAPTCHA_FAILED') {
    console.log('✅ PASS: Bot request successfully blocked by Turnstile verification!\n');
  } else {
    throw new Error('❌ FAIL: Turnstile should have blocked request without token');
  }

  // Test 2: Valid Turnstile OTP Generation
  console.log('--- TEST 2: Valid OTP Generation with Turnstile Token ---');
  const validOtpRes = await fetch(`${API_URL}/customer/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'ananya.mukherjee@sutradara.in',
      turnstileToken: 'mock-turnstile-token',
    }),
  });
  const validOtpData = (await validOtpRes.json()) as any;
  console.log(`Valid OTP Request Status: ${validOtpRes.status}`, validOtpData);
  if (validOtpRes.ok && validOtpData.devOtp) {
    console.log(`✅ PASS: Verification code ${validOtpData.devOtp} generated successfully!\n`);
  } else {
    throw new Error('❌ FAIL: Valid OTP request failed');
  }

  // Test 3: OTP Verification & Customer Registration
  console.log('--- TEST 3: OTP Verification & Customer Registration ---');
  const verifyRes = await fetch(`${API_URL}/customer/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'ananya.mukherjee@sutradara.in',
      otp: validOtpData.devOtp,
      name: 'Ananya Mukherjee',
      phone: '+91 98765 43210',
    }),
  });
  const verifyData = (await verifyRes.json()) as any;
  console.log(`Verify OTP Status: ${verifyRes.status}`, verifyData.user);
  if (!verifyRes.ok || !verifyData.accessToken) {
    throw new Error('❌ FAIL: OTP verification failed');
  }
  console.log('✅ PASS: Customer logged in with 30-day accessToken!\n');
  const customerToken = verifyData.accessToken;
  const customerId = verifyData.user.id;

  // Test 4: Google Identity Services Sign-In
  console.log('--- TEST 4: Google Identity Services Sign-In ---');
  const googleRes = await fetch(`${API_URL}/customer/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken: 'mock-google-token:priya.verma@gmail.com',
    }),
  });
  const googleData = (await googleRes.json()) as any;
  console.log(`Google Sign-In Status: ${googleRes.status}`, googleData.user);
  if (googleRes.ok && googleData.user.email === 'priya.verma@gmail.com') {
    console.log('✅ PASS: Google 1-click registration/sign-in verified!\n');
  } else {
    throw new Error('❌ FAIL: Google sign-in failed');
  }

  // Test 5: Create Order & Verify Immutable Customer Snapshot
  console.log('--- TEST 5: Order Creation with Immutable Customer Snapshot ---');
  const product = await prisma.product.findFirst({ where: { stock: { gt: 0 } } });
  if (!product) {
    throw new Error('No product available in catalog to test order');
  }

  const orderRes = await fetch(`${API_URL}/customer/orders/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      items: [{ productId: product.id, quantity: 1 }],
      shippingAddress: {
        recipientName: 'Sunita Verma (Mother)',
        recipientPhone: '+91 91234 56789',
        street: 'Flat 4B, Heritage Palms',
        landmark: 'Near Silk Board',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
    }),
  });
  const orderData = (await orderRes.json()) as any;
  console.log(`Order Creation Status: ${orderRes.status}`, orderData.order);
  if (!orderRes.ok || !orderData.order) {
    throw new Error(`❌ FAIL: Order creation failed: ${JSON.stringify(orderData)}`);
  }

  // Verify in PostgreSQL that customerName, customerEmail, customerPhone are snapshotted
  const dbOrder = await prisma.order.findUnique({
    where: { id: orderData.order.id },
  });
  console.log('Order Snapshot in PostgreSQL:', {
    orderNumber: dbOrder?.orderNumber,
    customerName: dbOrder?.customerName,
    customerEmail: dbOrder?.customerEmail,
    customerPhone: dbOrder?.customerPhone,
  });

  if (
    dbOrder?.customerName === 'Ananya Mukherjee' &&
    dbOrder?.customerEmail === 'ananya.mukherjee@sutradara.in' &&
    dbOrder?.customerPhone === '+91 98765 43210'
  ) {
    console.log('✅ PASS: Order customer snapshot successfully recorded in PostgreSQL!\n');
  } else {
    throw new Error('❌ FAIL: Order customer snapshot did not match expected values');
  }

  // Test 6: 2-Step Customer Account Deletion & PII Anonymization
  console.log('--- TEST 6: 2-Step Customer Account Deletion & PII Anonymization ---');
  // Step 6a: Request deletion OTP
  const delOtpRes = await fetch(`${API_URL}/customer/account/delete-request-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
  });
  const delOtpData = (await delOtpRes.json()) as any;
  console.log(`Deletion OTP Request: ${delOtpRes.status}`, delOtpData);
  if (!delOtpRes.ok || !delOtpData.devOtp) {
    throw new Error('❌ FAIL: Failed to request deletion OTP');
  }

  // Step 6b: Execute Deletion with wrong text (Should Fail)
  const failDelRes = await fetch(`${API_URL}/customer/account`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      confirmationText: 'CANCEL', // Incorrect confirmation text
      otp: delOtpData.devOtp,
    }),
  });
  console.log(`Deletion with wrong phrase status (Should be 400): ${failDelRes.status}`);
  if (failDelRes.status !== 400) {
    throw new Error('❌ FAIL: Account deletion should require typing DELETE');
  }

  // Step 6c: Execute Deletion with correct text and OTP
  const confirmDelRes = await fetch(`${API_URL}/customer/account`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      confirmationText: 'DELETE',
      otp: delOtpData.devOtp,
    }),
  });
  const confirmDelData = (await confirmDelRes.json()) as any;
  console.log(`Deletion Confirm Status: ${confirmDelRes.status}`, confirmDelData);
  if (!confirmDelRes.ok) {
    throw new Error('❌ FAIL: Account deletion execution failed');
  }

  // Step 6d: Verify Database State
  const anonymizedCustomer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { addresses: true },
  });
  console.log('Anonymized Customer in DB:', anonymizedCustomer);

  if (
    anonymizedCustomer?.name === 'Deactivated Patron' &&
    anonymizedCustomer?.phone === null &&
    anonymizedCustomer?.deletedAt !== null &&
    anonymizedCustomer?.addresses.length === 0
  ) {
    console.log('✅ PASS: Customer PII anonymized and addresses purged!\n');
  } else {
    throw new Error('❌ FAIL: Customer was not properly anonymized');
  }

  // Step 6e: Verify the Order still exists with its immutable snapshot!
  const preservedOrder = await prisma.order.findUnique({
    where: { id: orderData.order.id },
  });
  console.log('Preserved Order after Account Deletion:', {
    orderNumber: preservedOrder?.orderNumber,
    customerName: preservedOrder?.customerName,
    customerEmail: preservedOrder?.customerEmail,
    customerPhone: preservedOrder?.customerPhone,
    status: preservedOrder?.status,
  });

  if (
    preservedOrder?.customerName === 'Ananya Mukherjee' &&
    preservedOrder?.customerEmail === 'ananya.mukherjee@sutradara.in' &&
    preservedOrder?.customerPhone === '+91 98765 43210'
  ) {
    console.log('✅ PASS: Historical Order retains immutable customer snapshot after deletion!\n');
  } else {
    throw new Error('❌ FAIL: Preserved order lost customer snapshot');
  }

  console.log('🎉 ALL 6 VERIFICATION SUITES PASSED FLAWLESSLY!');
}

runVerification()
  .catch((err) => {
    console.error('Verification failed with error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
