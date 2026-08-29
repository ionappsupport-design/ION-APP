module.exports = async function handler(req, res) {
  const results = {};
  
  // Test 1: Can we require crypto?
  try { require('crypto'); results.crypto = 'ok'; } 
  catch(e) { results.crypto = e.message; }

  // Test 2: Can we require firebase-admin?
  try { require('firebase-admin'); results.firebaseAdmin = 'ok'; } 
  catch(e) { results.firebaseAdmin = e.message; }

  // Test 3: Can we require firebase-admin/app?
  try { require('firebase-admin/app'); results.firebaseAdminApp = 'ok'; } 
  catch(e) { results.firebaseAdminApp = e.message; }

  // Test 4: Can we require razorpay?
  try { require('razorpay'); results.razorpay = 'ok'; } 
  catch(e) { results.razorpay = e.message; }

  // Test 5: Is FIREBASE_SERVICE_ACCOUNT_JSON set?
  results.hasFirebaseJson = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  results.hasRazorpaySecret = !!process.env.RAZORPAY_KEY_SECRET;
  results.hasRazorpayId = !!process.env.RAZORPAY_KEY_ID;
  results.nodeVersion = process.version;

  return res.status(200).json(results);
};
