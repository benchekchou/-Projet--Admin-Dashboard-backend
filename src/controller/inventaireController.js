import { listNfts, listSlots } from "../services/inventaireService.js";
import logger from "../utils/looger.js";

export async function getNftsController(req, res) {
    try {
        const address = req.info.address;
        const nfts = await listNfts(address);

        await logger.info(`NFTs récupérés pour l'adresse ${address}`, { ip: req.ip });
        return res.status(200).json(nfts);
    } catch (error) {
        await logger.error(`Erreur lors de la récupération des NFTs: ${error.message}`, { ip: req.ip });
        return res.status(500).json({ error: "Failed to retrieve Nfts" });
    }
}

export async function getSlotsController(req, res) {
    try {
        const address = req.info.address;
        const slots = await listSlots(address);

        await logger.info(`Slots récupérés pour l'adresse ${address}`, { ip: req.ip });
        return res.status(200).json(slots);
    } catch (error) {
        await logger.error(`Erreur lors de la récupération des Slots: ${error.message}`, { ip: req.ip });
        return res.status(500).json({ error: "Failed to retrieve Slots" });
    }
}
