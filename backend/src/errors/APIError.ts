export default class APIError extends Error {
  public status: number;
  public cause?: unknown;

  constructor(
    message: string,
    status: number = 500,
    cause?: unknown
  ) {
    super(message);

    this.name = "APIError";
    this.status = status;
    this.cause = cause;

    Object.setPrototypeOf(this, APIError.prototype);

    Error.captureStackTrace?.(this, APIError);
  }
}