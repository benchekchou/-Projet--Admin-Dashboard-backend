import { PrismaClient } from "@prisma/client";
import { convertUsdToEth } from "../utils/convertireUsdToETH.js";
const prisma = new PrismaClient();

export async function getGlobalStats() {

    const totalUsers = await prisma.user.count();

    const totalSlots = await prisma.slots.count();

    const totalPacks = await prisma.packs.count();

    const totalNFTs = await prisma.nft.count();

    const packsAcheter = await prisma.pack_purchases.count();

    const slotsAcheter = await prisma.user_slots.count();

    const nftsMinter = await prisma.nft.count({
        where: {
            ownerWallet: {
                not: null
            }
        }
    });

    const revenueUSD = await prisma.pack_purchases.aggregate({
        _sum: { total_usd: true }
    });

    const revenueETH = await convertUsdToEth(revenueUSD._sum.total_usd?.toNumber() || 0)
    return {
        totalUsers,
        totalSlots,
        totalPacks,
        packsAcheter,
        slotsAcheter,
        nftsMinter,
        totalNFTs,
        revenue: {
            usd: revenueUSD._sum.total_usd?.toNumber() || 0,
            eth: revenueETH || 0
        }
    };
}


export async function statistiquePacksService(idPack = undefined) {
    try {
        // Récupérer tous les types de packs
        let packs;
        if (idPack) {
            packs = await prisma.packs.findMany({
                where: { id: parseInt(idPack) },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    price_usd: true
                }
            });
            if (packs.length === 0)
                return {
                    success: false,
                    message: "pack not found"
                }
        }
        else
            packs = await prisma.packs.findMany({
                select: {
                    id: true,
                    name: true,
                    type: true,
                    price_usd: true
                }
            });

        // Grouper les achats par pack
        const purchasesGrouped = await prisma.pack_purchases.groupBy({
            by: ["pack_id"],
            _sum: {
                quantity: true,
                total_usd: true
            }
        });

        // Construire stats détaillées
        const breakdown = await Promise.all(
            packs.map(async (pack) => {
                const stats = purchasesGrouped.find(p => p.pack_id === pack.id);

                const totalPurchased = stats?._sum.quantity || 0;
                const revenueUSD = stats?._sum.total_usd?.toNumber() || 0;
                const revenueETH = await convertUsdToEth(revenueUSD);

                return {
                    packId: pack.id,
                    name: pack.name,
                    type: pack.type,
                    priceUsd: Number(pack.price_usd),
                    totalPurchased,
                    revenueUSD,
                    revenueETH
                };
            })
        );

        if (idPack)
            return {
                success: true,
                data: breakdown
            };
        else {
            // Totaux globaux
            const totalPurchased = breakdown.reduce((sum, b) => sum + b.totalPurchased, 0);
            const totalRevenueUSD = breakdown.reduce((sum, b) => sum + b.revenueUSD, 0);
            const totalRevenueETH = await convertUsdToEth(totalRevenueUSD);
            return {
                success: true,
                data: {
                    totalPurchased,
                    totalRevenueUSD,
                    totalRevenueETH,
                    details: breakdown
                }
            };
        }
    } catch (error) {
        console.error("❌ Erreur dans statistiquePacks:", error);
        return {
            success: false,
            message: "Erreur interne",
        };
    }

}

export async function statistiqueSlotsService(idSlot = undefined) {
    try {

        const slotStats = await prisma.user_slots.groupBy({
            by: ["slot_type_id", "status"],
            _count: { _all: true }
        });
        let slotTypes;
        if (idSlot) {
            slotTypes = await prisma.slots.findMany({
                where: { id: parseInt(idSlot) },
                select: {
                    id: true,
                    name: true,
                    level: true,
                    base_price_usd: true
                }
            });
            if (slotTypes.length === 0)
                return {
                    success: false,
                    message: "Slot not found"
                }
        }
        else
            slotTypes = await prisma.slots.findMany({
                select: {
                    id: true,
                    name: true,
                    level: true,
                    base_price_usd: true
                }
            });

        const result = await Promise.all(
            slotTypes.map(async (type) => {
                const statsForType = slotStats.filter(s => s.slot_type_id === type.id);

                const totalPurchased = statsForType.reduce((sum, s) => sum + s._count._all, 0);

                const activeCount = statsForType
                    .filter(s => s.status === "active")
                    .reduce((sum, s) => sum + s._count._all, 0);

                const availableCount = statsForType
                    .filter(s => s.status === "available")
                    .reduce((sum, s) => sum + s._count._all, 0);

                const lockedCount = statsForType
                    .filter(s => s.status === "locked")
                    .reduce((sum, s) => sum + s._count._all, 0);

                const archivedCount = statsForType
                    .filter(s => s.status === "archived")
                    .reduce((sum, s) => sum + s._count._all, 0);


                const revenueUSD = totalPurchased * Number(type.base_price_usd);
                const revenueETH = await convertUsdToEth(revenueUSD);

                return {
                    slotTypeId: type.id,
                    name: type.name,
                    level: type.level,
                    basePriceUsd: Number(type.base_price_usd),
                    totalPurchased,
                    activeCount,
                    availableCount,
                    lockedCount,
                    archivedCount,
                    revenueUSD,
                    revenueETH
                };
            })
        );

        if (idSlot)
            return {
                success: true,
                data: result
            };
        else {
            const totalRevenue = result.reduce((sum, r) => sum + r.revenueUSD, 0);
            const totalPurchased = result.reduce((sum, r) => sum + r.totalPurchased, 0);
            const totalRevenueETH = await convertUsdToEth(totalRevenue);
            return {
                success: true,
                data: {
                    totalRevenue,
                    totalRevenueETH,
                    totalPurchased,
                    details: result
                }
            }
        }
    } catch (error) {
        console.error("❌ Erreur dans statistiquePacks:", error);
        return {
            success: false,
            message: "Erreur interne",
        };
    }
}