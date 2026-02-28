import sanitizeHtml from "sanitize-html";

export default function sanitizeInput(req, res, next) {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === "string") {
                req.body[key] = sanitizeHtml(req.body[key], {
                    allowedTags: [], // aucun tag HTML autorisé
                    allowedAttributes: {}
                });
            }
        }
    }
    next();
}