const notFoundMiddleware = (req, res, next) => {
  res.status(404).json({
    message: "Endpoint no encontrado",
  });
};

export default notFoundMiddleware;
