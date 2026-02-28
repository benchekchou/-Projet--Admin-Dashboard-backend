import { getGlobalStats, statistiquePacksService, statistiqueSlotsService } from "../services/statistiqueService.js";


 export async function getGlobalStatsController(req, res) {
    try {
      const stats = await getGlobalStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      console.error("Erreur getGlobalStats:", err);
      res.status(500).json({ success: false, message: "Erreur de serveur" });
    }
  }

export async function getStatistiquePacksController(req,res) {
    let reponse;
    try {
        const idPack=req.params.id
        console.log("idPack",idPack)
        reponse=await statistiquePacksService(idPack)
        if(reponse.success)
            return res.json(reponse)
        else
            return res.status(500).json(reponse)
    } catch (error) {
        return res.status(500).json(reponse);
    }
    
}


export async function getStatistiqueSlotsController(req, res) {
  let reponse;
  console.log("good")
  try {
    const idSlot = req.params.id
    reponse = await statistiqueSlotsService(idSlot);
    console.log(reponse)
    if (reponse.success)
      return res.json(reponse)
    else
      return res.status(500).json(reponse)
  } catch (error) {
    console.log(error)
    return res.status(500).json(reponse);
  }
}