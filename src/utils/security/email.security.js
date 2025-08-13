import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "293a41fc373a10",
    pass: "75ec897a3e797c",
  },
});
export const sendConfirmationEmail = async ({ firstName, email, otp }) => {
  await transporter.sendMail({
    from: `"${process.env.APP_NAME}" <${process.env.MAIL_HOST}>`,
    to: email,
    subject: "Email Confirmation OTP",
    html: `
      <h2>Welcome ${firstName}</h2>
      <p>Here is the OTP: ${otp}</p>
      please post to /auth/confirm-email/verify with OTP as "userCode"
    `,
  });
};
