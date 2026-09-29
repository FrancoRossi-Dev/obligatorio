import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { loginService, registerService } from '../services/auth.services.js';


export const ingresarUsuario = async (req, res) => {

  const {username, password} = req.body;
  const { usuario, token } = await loginService(username, password);
  res.json({ message: 'Iniciando sesión', usuario: { username }, token });
};



export const registrarUsuario =  async (req, res) => {
  const { username, password } = req.body;
  const { usuario, token } = await registerService(username, password);
  res.json({ message: 'Registrando usuario con hash', usuario: { username}, token });
};