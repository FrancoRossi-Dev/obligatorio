import { Groq } from 'groq-sdk';
import 'dotenv/config';
import { daysAgo, toIsoDate } from '../utils/date.js';
import { ERRORS, httpError } from '../utils/http-error.js';

// Provider layer for the client news report: only this file knows the analysis runs on Groq.

// Created on first use: the SDK throws when GROQ_API_KEY is missing, and doing that at import time
// would stop the whole API from starting instead of only this endpoint
let groq = null;
const getGroq = () => {
  if (!process.env.GROQ_API_KEY) {
    throw httpError(ERRORS.aiAnalysisUnavailable, { reason: 'GROQ_API_KEY is not configured' });
  }
  groq ??= new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
};

const MODEL = 'openai/gpt-oss-120b';
const NEWS_WINDOW_DAYS = 30;
const NEWS_PER_INSTRUMENT = 3;

// Citation markers the model writes, e.g. 【2†L6-L10】; they point into its own browsing session,
// so they mean nothing to the client. Sources are returned separately instead.
const CITATION_MARKER = /【[^】]*】/g;

// browser_search has no date filter, so the model gets explicit dates instead of "the last 30 days":
// its own sense of "today" comes from its training data and can be months off
const getNewsWindow = () => ({
  from: toIsoDate(daysAgo(NEWS_WINDOW_DAYS)),
  to: toIsoDate(new Date()),
});

// Every page the model searched or opened, deduplicated by URL
const collectConsultedSources = (executedTools = []) => {
  const sources = new Map();
  for (const tool of executedTools) {
    const pages = [...(tool.search_results?.results ?? []), ...(tool.browser_results ?? [])];
    for (const { title, url } of pages) {
      if (url && !sources.has(url)) sources.set(url, { title: title ?? null, url });
    }
  }
  return [...sources.values()];
};

// The model writes cited URLs inline, bare, as <url> or as markdown links
const URL_PATTERN = /https?:\/\/[^\s<>()[\]"'|]+/g;
const TRAILING_PUNCTUATION = /[.,;:]+$/;

// sources: what the analysis cites. foundInSearch false means the URL never came back from a search,
// so it may be made up and deserves a check. consultedSources: pages seen but not cited.
const splitSources = (analysis, consulted) => {
  const cited = new Set(
    (analysis.match(URL_PATTERN) ?? []).map((url) => url.replace(TRAILING_PUNCTUATION, '')),
  );
  const consultedByUrl = new Map(consulted.map((source) => [source.url, source]));

  return {
    sources: [...cited].map((url) => ({
      title: consultedByUrl.get(url)?.title ?? null,
      url,
      foundInSearch: consultedByUrl.has(url),
    })),
    consultedSources: consulted.filter((source) => !cited.has(source.url)),
  };
};

// Search coverage: Exa, the engine behind browser_search, covers large listed companies well, but
// local bonds and funds (e.g. Uruguayan sovereign debt) often return nothing, and the ISIN alone
// rarely matches news. Adding the issuer name to each position would improve hits; until then the
// prompt makes the model state that no news were found rather than fill the gap.
const buildPrompt = (topPositions, { from, to }) => `
Act as a financial analyst supporting a wealth advisor on the Abakus platform.

Today's date is ${to}.

Search the web for RECENT information and news about the following
financial instruments, which are the ${topPositions.length} largest positions
in a client's portfolio (marketValue in USD, percentage = share of
the portfolio):

${JSON.stringify(topPositions, null, 2)}

DATES:

- Only use news published between ${from} and ${to}, both inclusive.
- Check the publication date of every article before using it.
- Discard any article published before ${from} or whose publication
  date you cannot verify.
- Write every date in YYYY-MM-DD format.
- If you find no news published between ${from} and ${to} for an
  instrument, state clearly:
  "No relevant news found between ${from} and ${to}."
- Never present past events as current.
- Only search for news from this window; do not search earlier months.
- This rule covers the whole answer, including risks, opportunities
  and the conclusion: never mention or cite an article published
  before ${from}.

SOURCES:

- Prefer established financial and news outlets.
- For every article, give the outlet name, the publication date and
  the full article URL.
- Do not invent news, dates, events, sources or URLs.
- Base the analysis only on information found through the web search.

FOR EACH INSTRUMENT:

1. State:
   - name
   - ticker
   - ISIN
   - market value
   - share of the portfolio

2. List the relevant articles published between ${from} and ${to} that
   came back in your search results, up to ${NEWS_PER_INSTRUMENT}, each about a
   different event. Only cite an article whose URL appeared in your
   search results, and copy that URL exactly. Fewer articles are better
   than unverified ones: never fill the list with articles, figures or
   URLs you did not find.

3. For each article, briefly explain:
   - what happened
   - publication date
   - outlet and URL
   - why it may matter for this instrument

4. Assess:
   - main risks
   - potential opportunities
   - upcoming events that could affect the investment

5. Relate the analysis to the client's actual exposure. News about an
   instrument that makes up a large share of the portfolio matters more
   to the client.

Finish with an OVERALL CONCLUSION on which recent events could be
relevant to the ${topPositions.length} largest positions and what combined
share of the portfolio they represent.

Do not make buy or sell recommendations.

Do not include information that does not appear in the sources found.

WRITE THE ENTIRE ANALYSIS AND FINAL ANSWER IN ENGLISH.
`;

const buildPromptES = (topPositions, { from, to }) => `
Actúa como un analista financiero.

La fecha de hoy es ${to}.

Debes buscar en Internet información y noticias RECIENTES sobre
los siguientes instrumentos financieros, que representan las
${topPositions.length} principales posiciones de la cartera de un cliente
(marketValue en USD, percentage = porcentaje de la cartera):

${JSON.stringify(topPositions, null, 2)}

IMPORTANTE SOBRE LAS FECHAS:

- Busca únicamente noticias publicadas entre el ${from} y el ${to}, ambas fechas inclusive.
- Verifica la fecha de publicación de cada noticia antes de utilizarla.
- Descarta cualquier noticia publicada antes del ${from} o cuya fecha
  de publicación no puedas verificar.
- Escribe todas las fechas con el formato AAAA-MM-DD.
- Si no encuentras noticias publicadas entre el ${from} y el ${to}
  para un instrumento, indica claramente:
  "No se encontraron noticias relevantes entre el ${from} y el ${to}".
- No presentes acontecimientos antiguos como si fueran actuales.
- Busca solo noticias de este período; no busques meses anteriores.
- Esta regla vale para toda la respuesta, incluidos los riesgos, las
  oportunidades y la conclusión: nunca menciones ni cites una noticia
  publicada antes del ${from}.

FUENTES:

- Prioriza fuentes financieras y periodísticas reconocidas.
- Para cada noticia indica el nombre del medio, la fecha de publicación
  y la URL completa del artículo.
- No inventes noticias, fechas, acontecimientos, fuentes ni URLs.
- Basa el análisis únicamente en información encontrada mediante
  la búsqueda en Internet.

PARA CADA INSTRUMENTO:

1. Indica:
   - nombre
   - ticker
   - ISIN
   - market value
   - porcentaje que representa dentro de la cartera

2. Presenta las noticias relevantes publicadas entre el ${from} y el ${to}
   que aparecieron en los resultados de tu búsqueda, hasta ${NEWS_PER_INSTRUMENT}, cada
   una sobre un hecho distinto. Cita solo artículos cuya URL apareció
   en los resultados de la búsqueda, y copia esa URL exactamente. Es
   mejor presentar menos noticias que noticias no verificadas: nunca
   completes la lista con artículos, cifras ni URLs que no encontraste.

3. Para cada noticia explica brevemente:
   - qué ocurrió
   - fecha de publicación
   - medio y URL
   - por qué puede ser relevante para ese instrumento

4. Analiza:
   - principales riesgos
   - posibles oportunidades
   - acontecimientos que puedan afectar la inversión

5. Relaciona el análisis con la exposición concreta del cliente.
   Una noticia sobre un instrumento que representa un porcentaje
   elevado de la cartera puede tener mayor relevancia para el cliente.

Finalmente realiza una CONCLUSIÓN GENERAL explicando qué
acontecimientos recientes podrían ser relevantes para las
${topPositions.length} principales posiciones y qué porcentaje conjunto
representan dentro de la cartera.

No hagas recomendaciones de compra o venta.

No inventes información que no aparezca en las fuentes encontradas.

TODO EL ANÁLISIS Y LA RESPUESTA FINAL DEBEN ESTAR EN ESPAÑOL.

Usa español neutro latinoamericano, adecuado para Uruguay: sin voseo
ni expresiones de España (escribe "monitorear" y "costos", no
"monitorizar" ni "costes"; nunca uses "vosotros").
`;

// browser_search can't be combined with response_format (structured outputs), so the analysis comes
// back as free markdown. If the front end needs fields instead of text:
// 1. Two calls: this one gathers the news, a second one without tools turns that text into JSON
//    with response_format json_schema (more latency and tokens, but a guaranteed shape).
// 2. Ask for JSON in the prompt and JSON.parse it, falling back to the raw text when it fails.
// 3. Ask for a fixed markdown layout (one "## <ticker>" heading per instrument) and split on it.
const requestAnalysis = async (prompt) => {
  const client = getGroq();
  try {
    return await client.chat.completions.create(
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        tools: [{ type: 'browser_search' }],
        tool_choice: 'required',
        // Kept low so the request answers fast and stays within free-tier token limits for the
        // academic defense; higher effort runs longer browsing sessions and can be raised afterwards
        reasoning_effort: 'low',
      },
      // One retry at most, so a stalled request fails within about two minutes
      { timeout: 60_000, maxRetries: 1 },
    );
  } catch (error) {
    // 429 is the documented rate-limit answer; a single request larger than the tokens-per-minute
    // limit (8K on the free tier, easy to pass with browser_search) comes back as 413 instead
    if (error.status === 429 || error.status === 413) {
      throw httpError(ERRORS.aiRateLimited, { status: error.status });
    }
    throw httpError(ERRORS.aiAnalysisUnavailable, { status: error.status ?? null });
  }
};

const PROMPTS = { en: buildPrompt, es: buildPromptES };

// Searches recent news on the given positions (the client's largest) and returns the analysis with
// its sources. Throws a controlled 429/503 when the provider is rate-limited or unavailable.
export const analyzePortfolioNewsService = async (topPositions, language = 'en') => {
  const newsWindow = getNewsWindow();
  // Only what the model needs to search and weigh the news; internal ids stay out of the prompt
  const promptPositions = topPositions.map(({ name, ticker, isin, type, marketValue, percentage }) => ({
    name,
    ticker,
    isin,
    type,
    marketValue,
    percentage,
  }));
  const completion = await requestAnalysis(PROMPTS[language](promptPositions, newsWindow));
  const [choice] = completion.choices;
  const content = choice?.message?.content?.trim();
  // 'length' means the model ran out of tokens mid-answer: a cut-off analysis is not returned as valid
  if (!content || choice.finish_reason === 'length') {
    throw httpError(ERRORS.aiAnalysisUnavailable, {
      reason: 'incomplete answer',
      finishReason: choice?.finish_reason ?? null,
    });
  }
  const analysis = content.replace(CITATION_MARKER, '').trim();

  return {
    language,
    newsWindow,
    analysis,
    ...splitSources(analysis, collectConsultedSources(choice.message.executed_tools)),
  };
};
