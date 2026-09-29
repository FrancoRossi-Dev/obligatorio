import Joi from 'joi';

const objectId = Joi.string().hex().length(24).messages({
  'string.hex': 'El id debe ser un ObjectId válido',
  'string.length': 'El id debe tener 24 caracteres',
  'any.required': 'El id es obligatorio',
});

export const crearTesoroSchema = Joi.object({
  nombre: Joi.string().trim().required().min(2).max(50).messages({
    'string.empty': 'El nombre del tesoro no puede estar vacío',
    'any.required': 'El nombre del tesoro es obligatorio',
  }),
  tipo: Joi.string().trim().max(30),
  valor: Joi.number().min(0).messages({
    'number.base': 'El valor debe ser un número',
    'number.min': 'El valor no puede ser negativo',
  }),
});

export const tesoroIdParamSchema = Joi.object({
  id: objectId.required(),
});

// Usado en la ruta anidada /dragones/:dragonId/tesoros
export const dragonIdParamSchema = Joi.object({
  dragonId: objectId.required(),
});
