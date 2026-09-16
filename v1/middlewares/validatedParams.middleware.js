export const validarParamsMiddleware = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });
    if (error) {
      return res.status(400).json({ mensaje: "Error de validación", error });
    }
    req.validatedParams = value;
    next();
  };
};
