import {  getAllRewards } from "../services/rewardsService.js";



export async function getAllRewardsController(req,res) {
  try {
    let type;
    if(req.path.includes("/list"))
      type="all"
    else
      type="nft"
    const rewards=await getAllRewards(type);
    if(rewards.success)
      return res.json(rewards);
    else
      return res.status(400).json(rewards);
  } catch (error) {
    return res.status(500).json({message : "Erreur de serveur" });
  }
}