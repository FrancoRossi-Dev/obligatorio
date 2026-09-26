import Joi from 'joi';

// Lowercased so ids compare equal to the ones Mongoose returns
const objectId = (label) =>
  Joi.string().hex().length(24).lowercase().required().messages({
    'string.hex': `${label} id is not valid.`,
    'string.length': `${label} id is not valid.`,
    'any.required': `${label} id is required.`,
  });

export const clientReportParamsSchema = Joi.object({
  clientId: objectId('Client'),
});

export const clientInstrumentReportParamsSchema = Joi.object({
  clientId: objectId('Client'),
  instrumentId: objectId('Instrument'),
});

export const clientIssuerReportParamsSchema = Joi.object({
  clientId: objectId('Client'),
  issuerId: objectId('Issuer'),
});
