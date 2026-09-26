export const ERRORS = {
  invalidData: { status: 400, message: 'The submitted data is invalid.' },
  invalidCredentials: { status: 401, message: 'Invalid username or password.' },
  tokenMissing: { status: 401, message: 'An access token is required to use this resource.' },
  tokenInvalid: { status: 401, message: 'The access token is invalid or has expired.' },
  tokenRevoked: { status: 401, message: 'This session has already been closed.' },
  routeNotFound: { status: 404, message: 'The requested endpoint does not exist.' },
  clientNotFound: { status: 404, message: 'The requested client does not exist.' },
  usernameTaken: { status: 409, message: 'This username is already registered.' },
  emailTaken: { status: 409, message: 'This email is already linked to an advisor account.' },
  internal: { status: 500, message: 'An unexpected error occurred, please try again later.' },
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
