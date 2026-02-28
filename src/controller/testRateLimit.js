// src/controllers/test.controller.js




export const testController = (req, res) => {
  res.json({
    success: true,
    message: "API OK ✅",
    ip: getClientIp(req),
    account: req.info.address
  });
};
