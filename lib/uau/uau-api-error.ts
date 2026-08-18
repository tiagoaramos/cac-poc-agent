export class UauApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(`[${statusCode}] ${message}`);
    this.name = "UauApiError";
    this.statusCode = statusCode;
  }
}
