export const getClientIp = (req) => {
  let ip =
    req?.headers["x-forwarded-for"] || // si derrière un proxy
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip;

  if (ip === "::1" || ip === "127.0.0.1") {
    ip = "127.0.0.1"; // normaliser IPv6 localhost en IPv4
  }

  // Enlever "::ffff:" devant certaines adresses IPv4 mappées en IPv6
  if (ip && ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }

  return ip;
};