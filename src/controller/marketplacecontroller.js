import { getCatalog, getMarketplaceStats, statistiqueNFts } from "../services/marketplaceService.js";
import logger from "../utils/looger.js";

export async function statistiqueNFtsController(req, res) {
  try {
    const statistique = await statistiqueNFts();
    return res.status(200).json({
      success: true,
      data: statistique,
      message: "Statistique NFTs retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch statistique NFTs",
      error: error.message,
    });
  }
}

export async function getMarketplaceCatalogController(req, res) {
  try {
    const catalogData = await getCatalog();
    await logger.info("Marketplace catalog retrieved successfully", { ip: req.ip });
    res.status(200).json(catalogData);
  } catch (error) {
    await logger.error(`Error in getMarketplaceCatalogController: ${error.message}`, { ip: req.ip });
    res.status(500).json({ error: "Failed to retrieve marketplace catalog" });
  }
}

export async function getMarketplaceStatsController(req, res) {
  try {
    const stats = await getMarketplaceStats();
    await logger.info("Marketplace stats retrieved successfully", { ip: req.ip });
    res.status(200).json(stats);
  } catch (error) {
    await logger.error(`Error in getMarketplaceStatsController: ${error.message}`, { ip: req.ip });
    res.status(500).json({ error: "Failed to retrieve marketplace stats" });
  }
}
