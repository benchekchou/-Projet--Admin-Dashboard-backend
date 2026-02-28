import { PrismaClient } from "@prisma/client";
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();


export async function addSlot(data) {
  try {

    return await prisma.slots.create({
      data: {
        level: data.level,
        name: data.name,
        image_url: data.image_url,
        is_active: data.is_active ?? true,
        is_sellable: data.is_sellable ?? false,
        base_price_usd: data.base_price_usd,
        type: data.type
      },
    });
  } catch (error) {
    throw new Error("Erreur lors de la création du slot : " + error.message);
  }
}

export async function updateSlot(id, data) {
  try {

    const updateData = {};
    for (const key in data) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }
   
    const updateSlot = await prisma.slots.update({
      where: { id: Number(id) },
      data: { ...updateData },
    });
    return { success: true, slot: updateSlot };
  } catch (error) {
    console.error("❌ Error updateSlotService:", error);
    if (error.code === "P2025") {
      return {
        success: false,
        message: "Aucun slot trouvé avec cet ID",
      };
    }

    return { success: false, message: "Erreur lors de la mise à jour du slot " };
  }
}

export async function deleteSlot(id) {
  try {
    await prisma.slots.delete({
      where: { id: Number(id) },
    });
    return { success: true, message: "✅ Slot supprimé avec succès." };
  } catch (error) {
    if (error.code === "P2025") {
      return {
        success: false,
        message: "Aucun slot trouvé avec cet ID",
      };
    }
    return { success: false, message: "Erreur lors de la mise à jour du slot " };

  }
}

export async function getAllSlots() {
  try {
    return await prisma.slots.findMany({
      orderBy: { created_at: 'desc' }, // optionnel : trier du plus récent au plus ancien
    });
  } catch (error) {
    throw new Error("Erreur lors de la récupération des slots : " + error.message);
  }
}
export async function activateSlot(id) {
  try {
      // Vérifier si le pack existe
      const existingSlot = await prisma.slots.findUnique({
          where: { id: Number(id) }
      });

      if (!existingSlot) {
          return { error: true, status: 404, message: "Slot non trouvé" };
      }

      const updatedSlot = await prisma.slots.update({
          where: { id: Number(id) },
          data: {
              is_active: !existingSlot.is_active
          }
      });
      return { error: false, status: 200, data: updatedSlot };
  } catch (err) {
      console.error("Erreur Prisma updateSlot:", err);
      return { error: true, status: 500, message: "Erreur serveur interne" };
  }
}

