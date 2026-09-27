import { Groq } from 'groq-sdk';
import 'dotenv/config';
import Client from '../models/client.model.js';
import Position from '../models/Position.model.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const obtenerConsultaGroqService = async (messages) => {

    const chatCompletion = await groq.chat.completions.create({
    "messages": [
        {
        "role": "user",
        "content": messages
        },

    ],
    "model": "openai/gpt-oss-120b"
    });

return chatCompletion;

};

export const analizarNoticiasPortfolioService = async (clientId) => {
    //find client by id
  const client = await Client.findOne({
    _id: clientId,
    isDeleted: false,
  });

  if (!client) {
    throw new Error('Cliente no encontrado');
  }
  //find positions by clientId and isDeleted false
  const positions = await Position.find({
    clientId,
    isDeleted: false,
  }).populate('instrumentId');

  if (positions.length === 0) {
    throw new Error('El cliente no tiene posiciones');
  }

//total market value
 let totalMarketValue = 0;
for (const position of positions) {
  totalMarketValue += position.marketValue;
}
  // group positions by instrument
  const positionsByInstrument = new Map();

  for (const position of positions) {
    const instrument = position.instrumentId;

    if (!instrument) {
      continue;
    }

    const key = instrument.isin ?? instrument._id.toString();
    if (!positionsByInstrument.has(key)) {
      positionsByInstrument.set(key, {
        isin: instrument.isin,
        name: instrument.name,
        ticker: instrument.ticker,
        type: instrument.type,
        marketValue: 0,
        numberOfPositions: 0,
      });
    }

    const groupedPosition = positionsByInstrument.get(key);

    groupedPosition.marketValue += position.marketValue;
    groupedPosition.numberOfPositions += 1;
  }

  // TOP 3
  const topPositions = [...positionsByInstrument.values()]
    .sort((a, b) => b.marketValue - a.marketValue)
    .slice(0, 3)
    .map((position) => ({
      ...position,

      marketValue: Number(
        position.marketValue.toFixed(2),
      ),

      portfolioPercentage:
        totalMarketValue > 0
          ? Number(
              (
                (position.marketValue / totalMarketValue) *
                100
              ).toFixed(2),
            )
          : 0,
    }));

  const prompt = `
Actúa como un analista financiero.

Debes buscar en Internet información y noticias RECIENTES sobre
los siguientes instrumentos financieros, que representan las
tres principales posiciones de la cartera de un cliente:

${JSON.stringify(topPositions, null, 2)}

IMPORTANTE SOBRE LAS FECHAS:

- Busca únicamente noticias publicadas durante los ÚLTIMOS 30 DÍAS.
- Verifica la fecha de publicación de cada noticia antes de utilizarla.
- No utilices noticias antiguas para completar el análisis.
- Si no encuentras noticias publicadas durante los últimos 30 días
  para un instrumento, indica claramente:
  "No se encontraron noticias relevantes en los últimos 30 días".
- No presentes acontecimientos antiguos como si fueran actuales.

FUENTES:

- Prioriza fuentes financieras y periodísticas reconocidas.
- Indica la fuente y la fecha de cada noticia utilizada.
- No inventes noticias, fechas, acontecimientos ni fuentes.
- Basa el análisis únicamente en información encontrada mediante
  la búsqueda en Internet.

PARA CADA INSTRUMENTO:

1. Indica:
   - nombre
   - ticker
   - ISIN
   - market value
   - porcentaje que representa dentro de la cartera

2. Presenta las noticias relevantes encontradas durante
   los últimos 30 días.

3. Para cada noticia explica brevemente:
   - qué ocurrió
   - fecha
   - fuente
   - por qué puede ser relevante para ese instrumento

4. Analiza:
   - principales riesgos
   - posibles oportunidades
   - acontecimientos que puedan afectar la inversión

5. Relaciona el análisis con la exposición concreta del cliente.
   Una noticia sobre un instrumento que representa un porcentaje
   elevado de la cartera puede tener mayor relevancia para el cliente.

Finalmente realiza una CONCLUSIÓN GENERAL explicando qué
acontecimientos recientes podrían ser relevantes para las tres
principales posiciones y qué porcentaje conjunto representan
dentro de la cartera.

No hagas recomendaciones de compra o venta.

No inventes información que no aparezca en las fuentes encontradas.

TODO EL ANÁLISIS Y LA RESPUESTA FINAL DEBEN ESTAR EN ESPAÑOL.
`;

  const chatCompletion =
    await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',

      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],

      tools: [
        {
          type: 'browser_search',
        },
      ],

      tool_choice: 'required',
    });

  const analysis =
    chatCompletion.choices[0]?.message?.content ?? '';

  return {
    client: {
      id: client.id,
      name: client.clientDetails.commercialName,
    },

    portfolio: {
      totalMarketValue: Number(
        totalMarketValue.toFixed(2),
      ),

      topPositions,
    },

    analysis,
  };
};