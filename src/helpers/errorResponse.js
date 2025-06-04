const errorResponse = (
  res,
  code = 500,
  message = "Something went wrong",
  error
) =>
  res.status(code).json({
    status: "error",
    code,
    message,
    error,
  });

module.exports = errorResponse;
