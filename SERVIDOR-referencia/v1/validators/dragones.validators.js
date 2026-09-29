import Joi from 'joi';

const objectId = Joi.string().hex().length(24).messages({
  'string.hex': 'El id debe ser un ObjectId válido',
  'string.length': 'El id debe tener 24 caracteres',
  'any.required': 'El id es obligatorio',
});

export const crearDragonSchema = Joi.object({
  nombre: Joi.string().trim().required().min(2).max(50).messages({
    'string.empty': 'El nombre del dragón no puede estar vacío',
    'any.required': 'El nombre del dragón es obligatorio',
  }),
  especie: Joi.string().trim().max(50),
  edad: Joi.number().min(0).messages({
    'number.base': 'La edad debe ser un número',
    'number.min': 'La edad no puede ser negativa',
  }),
});

export const actualizarDragonSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(50),
  especie: Joi.string().trim().max(50),
  edad: Joi.number().min(0),
}).min(1).messages({
  'object.min': 'Debe enviar al menos un campo para actualizar',
});

export const dragonIdParamSchema = Joi.object({
  id: objectId.required(),
});
