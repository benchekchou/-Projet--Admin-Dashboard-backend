import {
  deleteMedias,
  getAllMedias,
  saveMedias,
  updateMedias,
  getMediaById,
} from "../services/mediaService.js";

const buildFullUrl = (req, relativeUrl) =>
  `${req.protocol}://${req.get("host")}${relativeUrl}`;

export const uploadMediaController = async (req, res) => {
  try {
    const { name } = req.body ?? {};
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    if (!name || !String(name).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Field `name` is required" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const type = req.params.type;
    const order_index = Number.parseInt(req.params.order_index, 10);

    if (Number.isNaN(order_index)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order_index parameter" });
    }

    const saveMedia = await saveMedias(fileUrl, type, order_index, String(name).trim());

    if (!saveMedia.success) {
      return res.status(500).json({ success: false, error: saveMedia.error });
    }

    const payload = {
      ...saveMedia.media,
      url: buildFullUrl(req, saveMedia.media.url),
    };

    return res
      .status(200)
      .json({ success: true, message: "File uploaded successfully", media: payload });
  } catch (error) {
    console.error("uploadMediaController error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};

export const updateMediaController = async (req, res) => {
  try {
    const { name } = req.body ?? {};
    if (!name || !String(name).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Field `name` is required" });
    }

    const id = req.params.id;
    const type = req.params.type;
    const order_index = Number.parseInt(req.params.order_index, 10);

    if (Number.isNaN(order_index)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order_index parameter" });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const updateMedia = await updateMedias(
      id,
      fileUrl,
      type,
      order_index,
      String(name).trim()
    );

    if (!updateMedia.success) {
      return res.status(500).json({ success: false, error: updateMedia.error });
    }

    const payload = {
      ...updateMedia.media,
      url: buildFullUrl(req, updateMedia.media.url),
    };

    return res
      .status(200)
      .json({ success: true, message: "File updated successfully", media: payload });
  } catch (error) {
    console.error("updateMediaController error:", error);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

export const deleteMediaController = async (req, res) => {
    try {
        const id = req.params.id;
        const deleteMedia = await deleteMedias(id);
        if (deleteMedia.success)
            return res.status(200).json({ success: true, message: "File deleted successfully" });
        else
            return res.status(500).json({ success: false, error: deleteMedia.error });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Delete failed" });
    }
}


export const getAllMediasController = async (req, res) => {
    try {
        let type;
        if (req.path.includes("videos"))
            type = "videos";
        else
            type = "image";

        const result = await getAllMedias(type);
        const medias = result.medias || [];
        

        const formatted = medias.map(m => ({
            ...m,
            url: buildFullUrl(req, m.url)
        }));
        res.status(200).json({ success: true, medias: formatted });
    } catch (error) {
        console.error("Error in getAllMediasController:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve medias" });
    }
}
export const getMediaByIdController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await getMediaById(id);
        if (!result.success) {
            return res.status(result.status).json({ success: false, message: result.error });
        }
        const mediaWithFullUrl = {
            ...result.media,
            url: `${req.protocol}://${req.get("host")}${result.media.url}`
        };
        res.status(200).json({ success: true, media: mediaWithFullUrl });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to retrieve media" });
    }
}
