import Usuario from "../models/usuario.model.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const loginService = async (username, password) => {
    const usuario = await Usuario.findOne({ username });
    if (!usuario) {
        const error = new Error("Datos incorrectos");
        error.status = 404;
        error.details = { username };
        throw error;
    }
    const validPassword = bcrypt.compareSync(password, usuario.password);
    if (!validPassword) {
        const error = new Error("Datos incorrectos");
        error.status = 401;
        error.details = { username };
        throw error;
    }
    const token = jwt.sign({ usuario: username }, process.env.SECRET_KEY, { expiresIn: '1h' });
    return { usuario, token };
};

export const registerService = async (username, password) => {
    const usuarioExistente = await Usuario.findOne({ username });
    if (usuarioExistente) {
        const error = new Error("El usuario ya existe");
        error.status = 409;
        error.details = { username };
        throw error;
    }
    const hashedPassword = bcrypt.hashSync(password, Number(process.env.ROUND));
    const usuario = new Usuario({ username, password: hashedPassword });
    const token = jwt.sign({ usuario: username }, process.env.SECRET_KEY, { expiresIn: '1h' });
    await usuario.save();
    return { usuario, token };
}