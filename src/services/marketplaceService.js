import { PrismaClient } from "@prisma/client";
import { ethers } from "ethers";

const prisma = new PrismaClient();


export async function statistiqueNFts() {
  try {
    const total = await prisma.nft.count();

    const sold = await prisma.nft.count({
      where: {
        ownerWallet: {
          not: null
        }
      }
    });

    const remaining = await prisma.nft.count({
      where: {
        ownerWallet: null
      }
    });

    return { total, sold, remaining };
  } catch (error) {
    console.error("Error fetching NFT stats:", error);
    throw new Error("Database query failed");
  }
}


export async function getCatalog() {
  try {
    // Prix : dernier order actif
    const lastOrder = await prisma.order.findFirst({
      where: { status: "completed" },
      orderBy: { createdAt: "desc" }
    });

    const priceWei = lastOrder
      ? ethers.parseEther(lastOrder.priceEth.toString()).toString()
      : "0";

    // Sold
    const sold = await prisma.order.count({
      where: { status: "completed" }
    });

    // Total
    const total = await prisma.nft.count();
    const remainingTotal = total - sold;

    // Rarity breakdown
    const breakdownRaw = await prisma.nft.groupBy({
      by: ["rarity"],
      _count: { rarity: true }
    });

    const rarityBreakdown = breakdownRaw.reduce((acc, item) => {
      acc[item.rarity] = item._count.rarity;
      return acc;
    }, {});

    return {
      priceWei,
      sold,
      remainingTotal,
      rarityBreakdown
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve catalog data");
  }
}

export async function getMarketplaceStats(){
    try {
    // Nombre total de ventes
    const sales = await prisma.order.count({
      where: { status: "completed" }
    });

    // Volume total
    const totalVolume = await prisma.order.aggregate({
      where: { status: "completed" },
      _sum: { priceEth: true }
    });

    // Breakdown par rareté
    const rarityStats = await prisma.order.groupBy({
      by: ["rarity"],
      where: { status: "completed" },
      _count: { rarity: true },
      _sum: { priceEth: true }
    });

    const perRarity = rarityStats.reduce((acc, item) => {
      acc[item.rarity] = {
        sales: item._count.rarity,
        volumeEth: item._sum.priceEth?.toString() || "0"
      };
      return acc;
    }, {});

    return {
        sales,
        volumeEth: totalVolume._sum.priceEth?.toString() || "0",
        perRarity
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve marketplace stats");
  }
}
