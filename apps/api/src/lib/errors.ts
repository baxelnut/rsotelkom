export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(message = "Bad request") {
    return new AppError(400, message, "BAD_REQUEST");
  }
  static unauthorized(message = "Unauthorized") {
    return new AppError(401, message, "UNAUTHORIZED");
  }
  static forbidden(message = "Forbidden") {
    return new AppError(403, message, "FORBIDDEN");
  }
  static notFound(message = "Not found") {
    return new AppError(404, message, "NOT_FOUND");
  }
}
