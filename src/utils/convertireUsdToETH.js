import axios from "axios";

// On peut mettre en cache le prix ETH/USD pour éviter d’appeler l’API à chaque requête
let cachedEthPrice = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 min

/**
 * Convertit un montant USD → ETH
 * @param {number} amountUsd - Montant en dollars
 * @returns {Promise<number>} - Montant converti en ETH
 */
export async function convertUsdToEth(amountUsd) {
  try {
    const now = Date.now();

    // Vérifie si le cache est encore valide
    if (!cachedEthPrice || now - lastFetchTime > CACHE_DURATION) {
      const response = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
        params: {
          ids: "ethereum",
          vs_currencies: "usd"
        },
        timeout: 3000
      });

      cachedEthPrice = response.data.ethereum.usd;
      lastFetchTime = now;
    }

    if (!cachedEthPrice || cachedEthPrice <= 0) {
      // Si pas de prix en cache, retourner null pour éviter de casser la réponse appelante
      return null;
    }

    return amountUsd / cachedEthPrice;
  } catch (error) {
    console.error("❌ Erreur convertUsdToEth:", error.message);
    // Fallback: si on a déjà un prix en cache, on l'utilise
    if (cachedEthPrice && cachedEthPrice > 0) {
      return amountUsd / cachedEthPrice;
    }
    // Sinon, on retourne null pour laisser l'appelant continuer sans price_eth
    return null;
  }
}
