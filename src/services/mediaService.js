import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

async function deleteFile(fileUrl) {
  try {
    if (!fileUrl) return false;

    // build absolute path in uploads folder
    const filePath = path.join(process.cwd(), fileUrl);

    await fs.unlink(filePath);
    return true;
  } catch (err) {
    // file not found or cannot be deleted
    return false;
  }
}

export async function saveMedias(filePath, type, order_index, name) {
  try {
    const media = await prisma.medias.create({
      data: { name, url: filePath, type, order_index }
    });
    return { success: true, media };
  } catch (error) {
    return { success: false, error: error.message, media: null };
  }
}

export async function updateMedias(id, newUrl, type, order_index, name) {
  try {
    id = parseInt(id);

    const old = await prisma.medias.findUnique({
      where: { id },
      select: { url: true }
    });

    if (!old) {
      return { success: false, error: "Media not found in database", media: null };
    }

    const dataToUpdate = {
      name,
      type,
      order_index
    };

    let shouldDeleteOldFile = false;
    if (newUrl) {
      dataToUpdate.url = newUrl;
      shouldDeleteOldFile = true;
    }

    const updatedMedia = await prisma.medias.update({
      where: { id },
      data: dataToUpdate
    });

    if (shouldDeleteOldFile && old && old.url) {
      const deleted = await deleteFile(old.url);
      if (deleted) console.log(`Deleted old file for media ${id}`);
    }

    return { success: true, media: updatedMedia };
  } catch (error) {
    return { success: false, error: error.message, media: null };
  }
}

export async function deleteMedias(id) {
  try {
    id = parseInt(id);

    const old = await prisma.medias.findUnique({
      where: { id },
      select: { url: true }
    });

    if (!old) {
      return { success: false, error: "Media not found in database", media: null };
    }

    const deleted = await deleteFile(old.url);

    if (!deleted) {
      return { success: false, error: "File not found on disk", media: null };
    }

    const mediaDelete = await prisma.medias.delete({ where: { id } });
    return { success: true, media: mediaDelete };
  } catch (error) {
    return { success: false, error: error.message, media: null };
  }
}

export async function getAllMedias(type) {
  try {
    console.log("type", type);
    const medias = await prisma.medias.findMany({
      where: { type },
      orderBy: { order_index: "asc" }
    });

    return { success: true, medias };
  } catch (error) {
    return { success: false, error: error.message, medias: null };
  }
}

export async function getMediaById(id) {
  try {
    const mediaId = parseInt(id);
    if (isNaN(mediaId)) {
      return { success: false, status: 400, error: "ID invalide", media: null };
    }
    const media = await prisma.medias.findUnique({ where: { id: mediaId } });
    if (!media) {
      return { success: false, status: 404, error: "Media non trouve", media: null };
    }
    return { success: true, status: 200, media };
  } catch (error) {
    return { success: false, status: 500, error: error.message, media: null };
  }
}


