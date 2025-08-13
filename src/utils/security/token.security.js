import jwt from "jsonwebtoken";
export const generateToken = async ({
  payload,
  secret,
  options = { expiresIn: 60 * 30 },
}) => jwt.sign(payload, secret, options);
export const verifyToken = async ({ token, secret }) =>
  jwt.verify(token, secret);
