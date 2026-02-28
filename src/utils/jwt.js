import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'mySecretKey';
const Expireed= process.env.JWT_EXPIRATION || '1h';
const ExpireedEmail=process.env.JWT_EXPIRATION_EMAIL  || '24h'
export function generateToken(payload,useInEmail=false) {
  return jwt.sign(payload, secret, { expiresIn: useInEmail ? ExpireedEmail : Expireed });
}

export function verifyToken(token) {
  return jwt.verify(token, secret);
}

export default generateToken;