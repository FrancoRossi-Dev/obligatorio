import jwt from "jsonwebtoken";

// En el header de las requests se espera el token en formato "Bearer <token>"
export const authenticateMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No se proporcionó el token" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token inválido" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }
    // Si el token es válido, se adjunta la información del usuario a la solicitud
    req.decoded = decoded;
    next();
  });
};
