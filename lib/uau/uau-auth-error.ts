export class UauAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UauAuthError";
  }
}
