import fetch from "node-fetch";

const URL = "http://localhost:5000/ping"; // une route publique
const TOTAL_REQUESTS = 200;

async function runTest() {
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    try {
      const res = await fetch(URL);
      console.log(`#${i + 1} => ${res.status}`);
    } catch (err) {
      console.error(`Erreur requête #${i + 1}`, err.message);
    }
  }
}

runTest();
