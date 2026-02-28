import { PrismaClient } from '@prisma/client';
import { success } from 'zod';
const prisma = new PrismaClient();



export async function getAllRewards(type){
  try {
    const typesDisponible=["nft","boost","early_access","all"]
    if(!typesDisponible.includes(type))
      return {success : false, message : "type n'est pas disponible"}
    let rewards;
    if(type==="all")
      rewards=await prisma.user_rewards.findMany({include : {user :  true} });
    else
      rewards=await prisma.user_rewards.findMany({where : {reward_type : type},include : {user : true} })
    return { success : true, rewards };
  } catch (error) {
    return {success : false,message : error.message }
  }
}


