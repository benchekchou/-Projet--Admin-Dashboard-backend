import { loginService, verifyTwoFACode } from "../services/authService.js";
import { createAdminLog, updateAdminRoleService } from "../services/usersAdminService.js";
import { verifyToken } from "../utils/jwt.js";

const ADMIN_ROLES = ["superadmin", "admin", "manager", "viewer"];

export async function isConnect(req,res){
    return res.status(200).json({isConnect : true})
}

export async function loginController(req, res) {
  try {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip;
    console.log("Adresse IP :", ip);
    console.log(req.body)
    const result = await loginService(req.body);
    console.log(result)
    if (!result.success) {
      return res.status(409).json({success : false,message :  "Invalid email or password"})
    } else { //auth succes
      return res.status(200).json({success:true,message : "le code de validation a été envoyé à l'email",result})
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({success : false, message : "Erreur d'authenfication, ressaye plus tard" })
  }
}

export async function verifyTwoFACodeController(req,res){
    try {
        const code=req.body.code;
        console.log(req.body)
        // const email=req.info.email;
        const reponse=await verifyTwoFACode(code);
        return res.status(reponse.success ? 200 : 500).json(reponse)
    } catch (error) {
        return res.status(500).json({success : false, message : "Erreur de serveur"})
    }
}

export async function verifyTokenController(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const token = tokenFromHeader || req.body?.token;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token manquant" });
    }

    const decoded = verifyToken(token);
    return res.status(200).json({ success: true, valid: true, decoded });
  } catch (err) {
    return res.status(401).json({ success: false, valid: false, message: "Token invalide" });
  }
}

