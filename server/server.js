// npm install express firebase-admin
// Run with: node server.js
// Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service-account JSON path.

const express = require("express");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp({ credential: applicationDefault() });

const app = express();
app.use(express.json());
app.use(express.static("public"));

const auth = getAuth();
const db = getFirestore();

async function requireUser(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) return res.status(401).json({ error: "Missing login token" });

  try {
    req.user = await auth.verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired login token" });
  }
}

app.get("/api/profile", requireUser, async (req, res) => {
  const doc = await db.collection("users").doc(req.user.uid).get();
  res.json(doc.exists ? doc.data() : {
    uid: req.user.uid,
    email: req.user.email ?? null,
    displayName: req.user.name ?? null
  });
});

app.put("/api/profile", requireUser, async (req, res) => {
  const displayName = typeof req.body.displayName === "string"
    ? req.body.displayName.trim().slice(0, 100)
    : "";

  const profile = {
    uid: req.user.uid,
    email: req.user.email ?? null,
    displayName,
    updatedAt: FieldValue.serverTimestamp()
  };

  await db.collection("users").doc(req.user.uid).set(profile, { merge: true });
  res.json({ uid: profile.uid, email: profile.email, displayName });
});

app.listen(3001, () => console.log("Server running at http://localhost:3001"));