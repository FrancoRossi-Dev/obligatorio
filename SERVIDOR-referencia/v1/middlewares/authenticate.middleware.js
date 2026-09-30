import jwt from 'jsonwebtoken';
const SECRET_KEY = 'mi_clave_secreta';


export const authenticateMiddleware = (req, res, next) => {

    //En el header de las requests se espera que el token esté en el formato "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No se proporcionó el token' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token inválido' });
    }
    
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token inválido' });
            }
            // Si el token es válido, se adjunta la información del usuario a la solicitud
            req.decoded = decoded;
            next();
        });
    
};