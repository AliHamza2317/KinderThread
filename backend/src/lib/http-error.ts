export type FieldErrors = Record<string, string[]>;

/** An error with an HTTP status. Thrown anywhere, turned into a JSON response by the error handler. */
export class HttpError extends Error {
  readonly status: number;
  readonly errors?: FieldErrors;

  constructor(status: number, message: string, errors?: FieldErrors) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.errors = errors;
  }
}

export const badRequest = (message: string, errors?: FieldErrors) => new HttpError(400, message, errors);
export const unauthorized = (message = "Please sign in to continue.") => new HttpError(401, message);
export const forbidden = (message = "You don't have permission to do that.") => new HttpError(403, message);
export const notFound = (message = "Not found.") => new HttpError(404, message);
export const conflict = (message: string, errors?: FieldErrors) => new HttpError(409, message, errors);
