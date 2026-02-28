import { activatePack, addPack, addPackContent, getActivePacks, getPackById, updatePack, updatePackContent, deletePack ,deletePackContent} from "../services/packsService.js";
import { createAdminLog } from "../services/usersAdminService.js";
import { convertUsdToEth } from "../utils/convertireUsdToETH.js";

import z from "zod";

const packSchema = z.object({
    name: z.string().min(3).max(255).optional(),
    description: z.string().max(1000).nullable().optional(),
    price_usd: z.preprocess(
        (val) => (val !== undefined ? Number(val) : undefined),
        z.number().positive().optional()
    ),
    image_url: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
    limited_quantity: z.number().int().positive().nullable().optional(),
    bonus_threshold: z.boolean().optional(),
    type: z.string().optional(), // si enum côté Prisma, tu peux remplacer
});

export const packContentSchema = z.object({
    pack_id: z.number({
        required_error: "pack_id est obligatoire",
        invalid_type_error: "pack_id doit être un nombre entier",
    }).int().positive().optional(),

    item_type: z.enum(["slot", "boost", "nft", "bonus"]).optional(),
    item_ref: z.number({
        required_error: "item_ref est obligatoire",
        invalid_type_error: "item_ref doit être un nombre entier",
    }).int().positive().optional(),

    quantity: z.number({
        invalid_type_error: "quantity doit être un nombre entier",
    }).int().positive().optional().default(1),
});





export async function addPackController(req, res) {
    try {
        const {
            name,
            description,
            price_usd,
            image_url,
            is_active,
            limited_quantity,
            bonus_threshold,
            type
        } = req.body;
        console.log(req.body)
        const parsed = packSchema.safeParse(req.body);
        if (!parsed.success) {
            console.log(parsed.error.errors);
            return res.status(400).json({
                success: false,
                message: "Erreur de validation",
                errors: parsed.error.errors
            });
        }


        const pack = await addPack({
            name,
            description,
            price_usd: Number(price_usd),
            image_url,
            is_active,
            limited_quantity,
            bonus_threshold,
            type
        });
        await createAdminLog({
            admin_id: req.info.id,
            action: "ADD_PACK",
            entityId: pack.id,
            details: { name, price_usd, type }
        });

        return res.status(201).json({
            message: "Pack ajouté avec succès.",
            data: pack
        });

    } catch (error) {
        console.error("❌ Erreur addPack:", error);

        // Gestion des erreurs Prisma
        if (error.code === "P2002") {
            return res.status(409).json({
                error: "Conflit : un pack avec le même nom existe déjà."
            });
        }

        return res.status(500).json({
            error: "Erreur interne du serveur",
            details: error.message
        });
    }
}

export async function activatePackController(req, res) {

    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "ID invalide" });
    }

    const result = await activatePack(id);

    if (result.error) {
        return res.status(result.status).json({ success: false, message: result.message });
    }
    // await createAdminLog({
    //     admin_id: req.info.id,
    //     action: "ACTIVATE_PACK",
    //     entityId: Number(id),
    //     details: result.error ? { error: result.message } : "Pack activé"
    // });
    return res.status(200).json({
        success: true,
        message: "Pack est active avec succès",
        data: result.data
    });


}

export async function updatePackController(req, res) {

    const { id } = req.params;

    // Validation de l'ID
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "ID invalide" });
    }

    // Validation du body
    const parsed = packSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: "Erreur de validation",
            errors: parsed.error.errors
        });
    }

    // Appel service
    const result = await updatePack(id, parsed.data);

    if (result.error) {
        return res.status(result.status).json({ success: false, message: result.message });
    }
    await createAdminLog({
        admin_id: req.info.id,
        action: "UPDATE_PACK",
        entityId: Number(id),
        details: result.error ? { error: result.message } : parsed.data
    });
    return res.status(200).json({
        success: true,
        message: "Pack mis à jour avec succès",
        data: result.data
    });
}


export async function updatePackContentController(req, res) {

    console.log("parametres : ", req.params)
    const { id } = req.params;

    // Validation de l'ID
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "ID invalide" });
    }

    const parsed = packContentSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: "Erreur de validation",
            errors: parsed.error.errors
        });
    }

    // Appel service
    console.log(req.body)
    console.log(parsed.data)
    const result = await updatePackContent(id, parsed.data);

    if (result.error) {
        return res.status(result.status).json({ success: false, message: result.message });
    }
    await createAdminLog({
        admin_id: req.info.id,
        action: "UPDATE_PACK_CONTENT",
        entityId: Number(id),
        details: result.error ? { error: result.message } : parsed.data
    });
    return res.status(200).json({
        success: true,
        message: "Pack content mis à jour avec succès",
        data: result.data
    });
}

export async function addPackContentsController(req, res) {
    try {
        const { pack_id, item_type, item_ref, quantity } = req.body;
        const VALID_ITEM_TYPES = ["slot", "boost", "nft", "bonus"];

        // ✅ Validation simple
        if (!pack_id || !item_type || !item_ref) {
            return res.status(400).json({ error: "pack_id, item_type et item_ref sont requis." });
        }

        if (!VALID_ITEM_TYPES.includes(item_type)) {
            return res.status(400).json({ error: `item_type invalide. Doit être l'un de: ${VALID_ITEM_TYPES.join(", ")}` });
        }

        if (quantity != null && (isNaN(quantity) || quantity < 1)) {
            return res.status(400).json({ error: "quantity doit être un entier >= 1." });
        }

        const packContent = await addPackContent({
            pack_id: Number(pack_id),
            item_type,
            item_ref: Number(item_ref),
            quantity: quantity != null ? Number(quantity) : undefined
        });
        // await createAdminLog({
        //     admin_id: req.info.id,
        //     action: "ADD_PACK_CONTENT",
        //     entityId: Number(pack_id),
        //     details: { item_type, item_ref, quantity }
        // });
        return res.status(200).json({
            message: "Pack content ajouté avec succès.",
            data: packContent
        });

    } catch (error) {
        console.error("❌ Erreur addPackContents:", error.message);

        // Gestion des erreurs Prisma
        if (error.code === "P2003") {
            return res.status(400).json({
                error: "Contrainte FK violée : pack_id ou item_ref inexistant."
            });
        }
        if (error.code === "P2002") {
            return res.status(409).json({
                error: "Conflit : cet élément existe déjà pour ce pack."
            });
        }

        return res.status(500).json({
            error: "Erreur interne du serveur",
            details: error.message
        });
    }
}


export async function getActivePacksController(req, res) {
    try {

        let isAdmin = false;
        console.log("req.path", req.path)
        if (req.path.includes("/admin/"))
            isAdmin = true;
        console.log("isAdmin", isAdmin)
        const packs = await getActivePacks(isAdmin);

        const packsWithEth = await Promise.all(
            packs.map(async (pack) => ({
                ...pack,
                price_eth: pack.price_usd
                    ? (await convertUsdToEth(pack.price_usd)).toFixed(6)
                    : null
            }))
        );


        return res.status(200).json({
            message: !isAdmin ? "Liste des packs actifs" : "Liste complète des packs (admin)",
            data: packsWithEth
        });
    } catch (error) {
        console.error("❌ Erreur listActivePacks:", error.message);
        return res.status(500).json({
            error: "Erreur interne du serveur",
            details: error.message
        });
    }
}

export async function getPacksByIdController(req, res) {
    try {

        const { id } = req.params

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ error: "ID invalide." });
        }

        const pack = await getPackById(parseInt(id));

        if (!pack) {
            return res.status(404).json({ error: "Pack non trouvé." });
        }

        return res.status(200).json({
            message: "Pack trouvé",
            data: pack
        });
    } catch (error) {
        console.error("❌ Erreur getPacksByIdController:", error.message);
        return res.status(500).json({
            error: "Erreur interne du serveur",
            details: error.message
        });
    }
}

export async function deletePackController(req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ error: "ID invalide." });
        }

        const result = await deletePack(Number(id));

        if (result.error) {
            return res.status(result.status).json({ error: result.message });
        }

        // Log admin si besoin
        // await createAdminLog({
        //     admin_id: req.info?.id ?? null,
        //     action: "DELETE_PACK",
        //     entityId: Number(id),
        //     details: { message: "Pack supprimé" }
        // });

        return res.status(200).json({
            success: true,
            message: "Pack supprimé avec succès"
        });
    } catch (error) {
        console.error("❌ Erreur deletePackController:", error.message);
        return res.status(500).json({
            error: "Erreur interne du serveur",
            details: error.message
        });
    }
}

export async function deletePackContentController(req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ error: "ID invalide." });
        }

        const result = await deletePackContent(Number(id));

        if (result.error) {
            return res.status(result.status).json({ error: result.message });
        }

        // await createAdminLog({
        //     admin_id: req.info?.id ?? null,
        //     action: "DELETE_PACK_CONTENT",
        //     entityId: Number(id),
        //     details: { message: "Pack content supprimé" }
        // });

        return res.status(200).json({
            success: true,
            message: "Pack content supprimé avec succès"
        });
    } catch (error) {
        console.error("❌ Erreur deletePackContentController:", error.message);
        return res.status(500).json({
            error: "Erreur interne du serveur",
            details: error.message
        });
    }
}
