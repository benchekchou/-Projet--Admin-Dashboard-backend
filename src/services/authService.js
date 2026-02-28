import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import generateToken from "../utils/jwt.js";
import envoiEmail from "../utils/envoiEmail.js";
import * as crypto from "crypto";

const prisma = new PrismaClient();


export async function loginService({ email, password }) {
  try {
    if (typeof email !== "string" || typeof password !== "string") {
      return { success: false };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password;

    if (!normalizedEmail || !normalizedPassword) {
      return { success: false };
    }

    //Chercher user par email
    const user = await prisma.admins.findUnique({
      where: { email: normalizedEmail }
    });

    // L'admin n'a pas encore finalisé son inscription (pas de mot de passe hashé)
    if (!user || typeof user.password_hash !== "string" || user.password_hash.length === 0) {
      return { success: false };
    }

    //Vérifier l'existence et le mot de passe
    if (!(await bcrypt.compare(normalizedPassword, user.password_hash))) {
          console.log(reponse)

      return { success: false };
    }

    const reponse = await sendTwoFACode(normalizedEmail);

    console.log(reponse)
    if(!reponse.success)
      return  reponse ;
    return {success : true,message : "Code de validation envoyé à l'email"}
   
  } catch (error) {
    console.error('Login error:', error);
    return {success : false}
  }
}

export async function sendTwoFACode(email) {
  try {
   
    // Générer un code aléatoire à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Tu peux stocker en clair ou haché (recommandé pour sécurité)
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    // Sauvegarder le code dans la colonne twofa_secret (par ex. valable 5 min si tu veux ajouter expiration dans une autre colonne)
    await prisma.admins.update({
      where: { email },
      data: { twofa_secret: codeHash, twofa_secret_createdAt: new Date() }
    });

    // Construire contenu email
    const contenuEmail = `
      <h2>Votre code de validation Soluxury</h2>
      <p>Voici votre code de validation à usage unique :</p>
      <h1 style="letter-spacing: 4px;">${code}</h1>
      <p>⚠️ Ce code est valide pendant 15 minutes.</p>
    `;

    // Envoyer email
    await envoiEmail(
      email,
      "Code de validation Soluxury (2FA)",
      contenuEmail
    );

    return { success: true, message: "Code de validation envoyé à l'email" };
  } catch (err) {
    console.error("❌ Erreur sendTwoFACode:", err);
    return { success: false, message: "Erreur lors de l'envoi du code" };
  }
}

export async function verifyTwoFACode(code) {
  try {
    const codeHash = crypto.createHash("sha256").update(String(code)).digest("hex");
    const admins = await prisma.admins.findMany({ where: { twofa_secret: codeHash } });
    let  admin;
    if(admins.length > 0){
      admin = admins[0];
    }else{
      return { success: false, message: "Code introuvable ou déjà utilisé" };
    }
    if (!admin || !admin.twofa_secret || !admin.twofa_secret_createdAt) {
      return { success: false, message: "Code introuvable ou déjà utilisé" };
    }
    // Vérifier expiration (15 minutes = 300000 ms)
    const expirationMs = 15 * 60 * 1000;
    const isExpired = Date.now() - new Date(admin.twofa_secret_createdAt).getTime() > expirationMs;

    if (isExpired) {
      return { success: false, message: "Code expiré" };
    }

    // Vérifier le hash
  
    // ✅ Code valide : activer et reset
    await prisma.admins.update({
      where: { id: admin.id },
      data: {
        isActive: true,
        twofa_secret: null,
        twofa_secret_createdAt: null
      }
    });

    const { password_hash: _, ...userWithoutPassword } = admin; //eviter de renvoyer motapss a frontEnd
    // const userSerialize = serializeBigInt(userWithoutPassword);
    // console.log(userSerialize)
    const token = generateToken({ id: userWithoutPassword.id, email: userWithoutPassword.email, role: userWithoutPassword.role });
    return {
      success : true,
      user: userWithoutPassword,
      token,
    };
  } catch (err) {
    console.error("❌ Erreur verifyTwoFACode:", err);
    return { success: false, message: "Erreur vérification code" };
  }
}

