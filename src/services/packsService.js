import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function addPack(data) {
    try {
        return await prisma.packs.create({
            data: {
                name: data.name,
                description: data.description,
                price_usd: data.price_usd,
                image_url: data.image_url,
                is_active: data.is_active ?? true,
                limited_quantity: data.limited_quantity ?? null,
                bonus_threshold: data.bonus_threshold ?? false,
                type: data.type ?? null
            },
        });
    } catch (error) {
        throw new Error("Erreur lors de la création du pack : " + error.message);
    }
}


export async function activatePack(id) {
    try {
        // Vérifier si le pack existe
        const existingPack = await prisma.packs.findUnique({
            where: { id: Number(id) }
        });

        if (!existingPack) {
            return { error: true, status: 404, message: "Pack non trouvé" };
        }

        const updatedPack = await prisma.packs.update({
            where: { id: Number(id) },
            data: {
                is_active: !existingPack.is_active
            }
        });
        return { error: false, status: 200, data: updatedPack };
    } catch (err) {
        console.error("Erreur Prisma updatePack:", err);
        return { error: true, status: 500, message: "Erreur serveur interne" };
    }
}

export async function updatePack(id, data) {
    try {
        // Vérifier si le pack existe
        const existingPack = await prisma.packs.findUnique({
            where: { id: Number(id) }
        });

        if (!existingPack) {
            return { error: true, status: 404, message: "Pack non trouvé" };
        }

        const updateData = {};
        for (const key in data) {
            if (data[key] !== undefined) {
                updateData[key] = data[key];
            }
        }

        const updatedPack = await prisma.packs.update({
            where: { id: Number(id) },
            data: updateData
        });
        return { error: false, status: 200, data: updatedPack };
    } catch (err) {
        console.error("Erreur Prisma updatePack:", err);
        return { error: true, status: 500, message: "Erreur serveur interne" };
    }
}

export async function checkExistence(type, id) {
    try {
        console.log("type : ", type)
        console.log("type id", id)
        if (type === "nft") {
            const nft = await prisma.nft.findUnique({
                where: { id },
            });
            console.log("check : ", nft)
            return nft !== null;
        }

        if (type === "slot") {
            const slot = await prisma.slots.findUnique({
                where: { id },
            });
            return slot !== null;
        }

        return false; // si type inconnu
    } catch (error) {
        console.error("Erreur lors de la vérification :", error);
        return false;
    }
}

export async function updatePackContent(id, data) {
    try {
        // Vérifier si le pack content  existe
        console.log("id service : ", id)
        const existingPackContent = await prisma.pack_contents.findUnique({
            where: { id: Number(id) }
        });
        console.log("existing pack content ", existingPackContent)
        if (!existingPackContent) {
            return { error: true, status: 404, message: "Pack content non trouvé" };
        }

        if (data.pack_id !== undefined) {
            // verfie si idPack exist dans la table pack
            const existingPack = await prisma.packs.findUnique({
                where: { id: Number(data.pack_id) }
            });

            if (!existingPack) {
                return { error: true, status: 404, message: "Pack non trouvé" };
            }
        }
        if (data.item_type !== undefined && data.item_ref !== undefined && !(await checkExistence(data.item_type, data.item_ref))) {
            return {
                error: true,
                status: 401,
                message: `${data.item_type} avec id=${data.item_ref} n'existe pas dans la table ${data.item_type}`,
            };
        }
        const updateData = {};
        for (const key in data) {
            if (data[key] !== undefined) {
                updateData[key] = data[key];
            }
        }

        const updatedPack = await prisma.pack_contents.update({
            where: { id: Number(id) },
            data: updateData
        });
        return { error: false, status: 200, data: updatedPack };
    } catch (err) {
        console.error("Erreur Prisma updatePack:", err);
        return { error: true, status: 500, message: "Erreur serveur interne" };
    }
}

export async function addPackContent(data) {

    try {
        if (!(await checkExistence(data.item_type, data.item_ref))) {
            return {
                error: true,
                status: 401,
                message: `${data.item_type} avec id=${data.item_ref} n'existe pas dans la table ${data.item_type}`,
            };
        }

        return await prisma.pack_contents.create({
            data: {
                pack_id: data.pack_id,
                item_type: data.item_type,
                item_ref: data.item_ref,
                quantity: data.quantity ?? 1
            }
        });
    } catch (error) {
        throw new Error("Erreur lors de la création du pack content: " + error.message);

    }

}

export async function getActivePacks(isAdmin) {

    try {
        if (isAdmin) {
            return await prisma.packs.findMany({
                include: {
                    pack_contents: true  // Inclut les contenus liés
                },
                orderBy: {
                    created_at: 'desc'
                }
            });
        } else
            return await prisma.packs.findMany({
                where: {
                    is_active: true,
                },
                include: {
                    pack_contents: true  // Inclut les contenus liés
                },
                orderBy: {
                    created_at: 'desc'
                }
            });
    } catch (error) {
        throw new Error("Erreur getActivePacks : " + error.message);
    }
}

export async function getPackById(id) {

    try {
        return await prisma.packs.findUnique({
            where: {
                id
            },
            include: {
                pack_contents: true, // Inclut les contenus liés
                pack_purchases: true
            },
        });
    } catch (error) {
        throw new Error("Erreur getPackById : " + error.message);
    }
}

async function getUserSlotCount(userId, addressWallet) {
    try {
        // Compter les achats de packs
        const packCount = await prisma.pack_purchases.count({
            where: { user_id: userId },
        });

        // Compter les ordres de type "slot"
        const slotOrderCount = await prisma.order.count({
            where: {
                buyerWallet: addressWallet,
                itemType: "slot",
            },
        });

        return {
            success: true,
            packPurchases: packCount,
            slotOrders: slotOrderCount,
            total: packCount * 2 + slotOrderCount, //mulpilie packCount*2 car chaque pack contient 2 slot
        };
    } catch (error) {
        console.error("Erreur lors du comptage :", error);
        return {
            success: false,
            message: "Erreur interne lors du calcul",
            error: error.message,
        };
    }
}


export async function getUserPacksSummary(user_id) {
    try {
        // Récupérer toutes les lignes d'achat avec relation sur le type de pack
        const purchases = await prisma.pack_purchases.findMany({
            where: { user_id },
            include: {
                packs: { select: { type: true } },
            },
        });

        // Total
        const total = purchases.length;
        const details = purchases.reduce((acc, p) => {
            if (p.packs.type === "bronze") {
                if (p.used_in_rewards === 0) acc.bronze++;
                if (p.used_in_rewards === 1) acc.bronzeUsedInReward++;
            }
            if (p.packs.type === "silver") {
                if (p.used_in_rewards === 0) acc.silver++;
                if (p.used_in_rewards === 1) acc.silverUsedInReward++;
            }
            if (p.packs.type === "gold") {
                if (p.used_in_rewards === 0) acc.gold++;
                if (p.used_in_rewards === 1) acc.goldUsedInReward++;
            }
            return acc;
        }, {
            bronze: 0, silver: 0, gold: 0,
            bronzeUsedInReward: 0, silverUsedInReward: 0, goldUsedInReward: 0
        });

        return {
            success: true,
            user_id,
            total,
            details,
        };
    } catch (error) {
        console.error("❌ Erreur dans getUserPacksSummary:", error);
        return {
            success: false,
            message: "Erreur interne lors du calcul des packs",
            error: error.message,
        };
    }
}


export async function getUserPackPurchases(user_id) {
    try {
        return await prisma.pack_purchases.findMany({
            where: { user_id },
            include: {
                packs: {
                    include: {
                        pack_contents: true
                    }
                }
            },
            orderBy: {
                purchased_at: 'desc'
            }
        });
    } catch (error) {
        throw new Error("Erreur lors de la récupération des achats utilisateur : " + error.message);
    }
}

export async function deletePackContent(id) {
  try {
    const existingContent = await prisma.pack_contents.findUnique({
      where: { id: Number(id) },
    });

    if (!existingContent) {
      return { error: true, status: 404, message: "Pack content non trouvé" };
    }

    await prisma.pack_contents.delete({
      where: { id: Number(id) },
    });
    console.log("Deleted pack content with id:", id);

    return { error: false, status: 200, message: "Pack content supprimé avec succès" };
  } catch (err) {
    console.error("Erreur Prisma deletePackContent:", err);
    return { error: true, status: 500, message: "Erreur serveur interne" };
  }
}

export async function deletePack(id) {
  try {
    // Vérifier si le pack existe
    const existingPack = await prisma.packs.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPack) {
      return { error: true, status: 404, message: "Pack non trouvé" };
    }

    // ⚠️ Si tu veux aussi supprimer ses contenus liés
    await prisma.pack_contents.deleteMany({
      where: { pack_id: Number(id) }
    });

    // Supprimer le pack
    await prisma.packs.delete({
      where: { id: Number(id) },
    });

    return { error: false, status: 200, message: "Pack supprimé avec succès" };
  } catch (err) {
    console.error("Erreur Prisma deletePack:", err);
    return { error: true, status: 500, message: "Erreur serveur interne" };
  }
}
