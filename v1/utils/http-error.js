export const ERRORS = {
  invalidData: { status: 400, message: 'The submitted data is invalid.' },
  invalidCredentials: { status: 401, message: 'Invalid username or password.' },
  tokenMissing: { status: 401, message: 'An access token is required to use this resource.' },
  tokenInvalid: { status: 401, message: 'The access token is invalid or has expired.' },
  routeNotFound: { status: 404, message: 'The requested endpoint does not exist.' },
  clientNotFound: { status: 404, message: 'The requested client does not exist.' },
  noRecentPositions: {
    status: 404,
    message: 'No positions have been reported for this client in the last 30 days.',
  },
  usernameTaken: { status: 409, message: 'This username is already registered.' },
  aiRateLimited: {
    status: 429,
    message: 'The AI analysis request limit has been reached, please try again in a few minutes.',
  },
  emailTaken: { status: 409, message: 'This email is already linked to an advisor account.' },
  internal: { status: 500, message: 'An unexpected error occurred, please try again later.' },
  instrumentLookupUnavailable: {
    status: 503,
    message: 'The instrument reference service is unavailable, please try again later.',
  },
  aiAnalysisUnavailable: {
    status: 503,
    message: 'The AI analysis service is unavailable, please try again later.',
  },
};

export const httpError = ({ status, message }, details = null) => {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
};

export const validationError = (joiError) =>
  httpError(
    ERRORS.invalidData,
    joiError.details.map(({ path, message }) => ({ field: path.join('.'), message })),
  );
