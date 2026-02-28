import { addSlot, deleteSlot, updateSlot ,getAllSlots,activateSlot } from "../services/slotsService.js";
import { createAdminLog } from "../services/usersAdminService.js";

export async function addSlotController(req, res) {
  try {
    const { level, name, image_url, is_active, is_sellable, base_price_usd } = req.body;

    // Validation simple
    if (!level || !name || !base_price_usd) {
      return res.status(400).json({ error: "tout les champs sont requis." });
    }

    if (![1, 2, 3].includes(Number(level))) {
      return res.status(400).json({ error: "Le niveau doit être 1, 2 ou 3." });
    }

    const slot = await addSlot({
      level: Number(level),
      name,
      image_url,
      is_active,
      is_sellable,
      base_price_usd
    });
    await createAdminLog({
      adminId: req.info.id,
      action: "ADD_SLOT",
      entityId: slot.id,
      details: { level, name, base_price_usd }
    });

    return res.status(201).json({
      message: "Slot ajouté avec succès.",
      data: slot,
    });
  } catch (error) {
    console.error("❌ Erreur addSlot:", error.message);

    // Gestion des erreurs Prisma (ex: violation contrainte)
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Conflit : un enregistrement similaire existe déjà."
      });
    }

    return res.status(500).json({
      error: "Erreur interne du serveur",
      details: error.message
    });
  }
}

export const updateSlotController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID invalide" });
    }
    const level = req.body?.level;
    if (level !== undefined) {
      const lvl = Number(level);
      if (![1, 2, 3].includes(lvl)) {
        return res.status(400).json({ success: false, message: "Le niveau doit être 1, 2 ou 3." });
      }
    }

    const reponse = await updateSlot(id, req.body);
    // if (reponse.success)
    //   await createAdminLog({
    //     adminId: req.info.id,
    //     action: "UPDATE_SLOT",
    //     entityId: Number(id),
    //     details: reponse.success
    //       ? { updatedFields: req.body }
    //       : { error: reponse.message }
    //   });

    if (reponse.success)
      return res.status(200).json({
        success: true,
        message: "Slot mis à jour avec succès",
        slot: reponse.slot
      });
    else
      return res.status(400).json({ success: false, message: reponse.message });
  } catch (error) {
    console.error("❌ Erreur updateSlot:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la modification du slot",
      error: error.message,
    });
  }
};

export const deleteSlotController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID invalide" });
    }

    const reponse = await deleteSlot(id);
    // if (reponse.success)
    //   await createAdminLog({
    //     adminId: req.info.id,
    //     action: "DELETE_SLOT",
    //     entityId: Number(id),
    //     details: reponse.success ? "Slot supprimé" : { error: reponse.message }
    //   });
    if (reponse.success)
      return res.status(200).json({
        success: true,
        message: "Slot supprimé avec succès",
      });
    else
      return res.status(400).json({ success: false, message: reponse.message });
  } catch (error) {
    console.error("❌ Erreur deleteSlot:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du slot",
      error: error.message,
    });
  }
};

export const getAllSlotsController = async (req, res) => {
  try {
    const slots = await getAllSlots();

    // log admin (optionnel, car lecture simple, mais utile pour traçabilité)
    // await createAdminLog({
    //   adminId: req.info.id,
    //   action: "GET_ALL_SLOTS",
    //   entityId: null,
    //   details: { total: slots.length }
    // });

    return res.status(200).json({
      success: true,
      message: "Liste des slots récupérée avec succès",
      data: slots,
    });
  } catch (error) {
    console.error("❌ Erreur getAllSlots:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des slots",
      error: error.message,
    });
  }
};

export const activateSlotController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await activateSlot(id);
    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }
    return res.status(200).json({
      success: true,
      message: "Slot activé avec succès",
      data: result.data
    });
  }
  catch (error) {
    console.error("❌ Erreur activateSlot:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'activation du slot",
      error: error.message,
    });
  }
}
