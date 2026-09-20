import { ERRORS, httpError } from '../utils/http-error.js';

const notFoundMiddleware = () => {
  throw httpError(ERRORS.routeNotFound);
};

export default notFoundMiddleware;
