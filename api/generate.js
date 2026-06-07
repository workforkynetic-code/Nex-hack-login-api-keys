import admin from 'firebase-admin';

// Firebase Admin ko initialize karne ka check
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Private key ke line breaks ko theek karne ke liye replace lagaya hai
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.database();

export default async function handler(req, res) {
  // CORS Headers taaki frontend isko access kar sake
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Ek random unique key generate karna (Jaise: FF-X892BA)
    const randomKey = "FF-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 2. Firebase Database mein 'GeneratedKeys' folder ke andar data push karna
    const keyRef = db.ref('GeneratedKeys/' + randomKey);
    await keyRef.set({
      status: "active",
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    // 3. Frontend ko response mein sirf key bhejna
    return res.status(200).json({ key: randomKey });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
