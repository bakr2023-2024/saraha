import bcrypt from "bcrypt";
export const hash = async ({ originalText = "", salt = process.env.SALT }) =>
 bcrypt.hashSync(originalText, parseInt(salt));
export const compare = async ({ originalText, hashedText }) =>
 bcrypt.compareSync(originalText, hashedText);
