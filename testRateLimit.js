// testProtectedRateLimit.js
import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000/testRateLimit"; // ta route protégée
const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJERFVEVURBMjkyP0QiLCJ3YWxsZXRJZCI6IjE3NTYwMzQyMTQ5OTAwMWY0OWYyNy00MTIyLTRjODYtYTkwOC04NmExYjE5NjAyODYiLCJhZGRyZXNzIjoiMHhrZGpkazQ4ZDQ2NlRSSjU0ZmVmciIsImlhdCI6MTc1Njc0MzUxNiwiZXhwIjoxNzU2NzQ3MTE2fQ.iNt5WseFZIo90Wa5Utu0jGnSsoWzrrtcx6IuZfuN0uU"; // mets un vrai token
const IP = "127.0.0.1"; // ton IP locale simulée

// wallets fictifs pour tester la limite subnet
const wallets = [
  "0xWALLET01",
  "0xWALLET02",
  "0xWALLET03",
  "0xWALLET04", // ce 4ème devrait déclencher le blocage subnet
];

async function spam(wallet) {
  for (let i = 1; i <= 15; i++) {
    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT}`,
          "x-forwarded-for": IP, // simule l'IP (lu par getClientIp)
        },
        // body: JSON.stringify({ wallet }),
      });

      console.log(
        `Wallet ${wallet} - Req #${i} => ${res.status} ${
          res.status === 429 ? "🚫 Bloqué" : "✅ OK"
        }  `
      );
    } catch (err) {
      console.error("Erreur réseau:", err.message);
    }
  }
}

// ----- TEST 1 : spam avec un seul wallet -----
await spam(wallets[0]);

// ----- TEST 2 : spam avec plusieurs wallets (même IP) -----
for (const w of wallets) {
  await spam(w);
}
