export const asyncHandler = (fn) => async (req, res, next) =>
  await fn(req, res, next).catch(next);
export const globalErrorHandler = (err, req, res, next) =>
  res.status(err.cause || 400).json({ message: err.message, stack: err.stack });
export const successResponseHandler = ({
  res,
  status = 200,
  message = "Done",
  data = {},
} = {}) => res.status(status).json({ message, data });
