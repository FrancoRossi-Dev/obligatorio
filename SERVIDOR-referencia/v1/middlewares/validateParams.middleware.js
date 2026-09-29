export const validateParamsMiddleware = (schema) => {
  return (req, res, next) => {
    const { value, error } = schema.validate(req.params, { abortEarly: false });
    if (error) {
      return res.status(400).json({ mensaje: "Error de validación", error: error });
    }
    req.validatedParams = value;
    next();
  };
};