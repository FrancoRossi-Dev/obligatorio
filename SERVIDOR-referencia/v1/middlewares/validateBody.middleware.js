export const validateBodyMiddleware = (schema) => {
  return (req, res, next) => {
    const { value, error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ mensaje: "Error de validación", error: error });
    }
    req.validatedBody = value;
    next();
  };
};