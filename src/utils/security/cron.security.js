import cron from "node-cron";
import { deleteMany } from "../../db/db.services.js";
import OTP from "../../db/models/otp.model.js";
import Token from "../../db/models/token.model.js";
export function startCronJob() {
  cron.schedule(`*/${process.env.OTP_EXPIRES_IN} * * * *`, async () => {
    try {
      const result = await deleteMany({
        model: OTP,
        filter: { expireAt: { $lt: new Date() } },
      });
    } catch (err) {
      console.error("Error deleting the otp:", err);
    }
  });
  cron.schedule(`0 0 1 1 *`, async () => {
    try {
      const result = await deleteMany({
        model: Token,
        filter: { expiresIn: { $lt: Math.floor(Date.now() / 1000) } },
      });
    } catch (err) {
      console.error("Error deleting the revoke token:", err);
    }
  });

  console.log(
    `Expired OTP cron job scheduled to run every ${process.env.OTP_EXPIRES_IN} minutes`
  );
  console.log(`Dead token cron job cron job scheduled to run every 1 year`);
}
