const confirmEmailMiddleware = async (req, res, next) => {
  const { confirmEmail } = req.user;
  return !confirmEmail
    ? next(
        new Error(
          "Please post to /auth/confirm-email/send to confirm your email",
          { cause: 403 }
        )
      )
    : next();
};
export default confirmEmailMiddleware;
