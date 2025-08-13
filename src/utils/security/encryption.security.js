import CryptoJS from "crypto-js";
export const encrypt = async ({
  plainText = "",
  secret = process.env.ENCRYPTION_SECRET,
} = {}) => CryptoJS.AES.encrypt(plainText, secret).toString();
export const decrypt = async ({
  cipherText = "",
  secret = process.env.ENCRYPTION_SECRET,
}) => CryptoJS.AES.decrypt(cipherText, secret).toString(CryptoJS.enc.Utf8);
