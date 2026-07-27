export interface Logger {
  error(message: string, context?: Readonly<Record<string, unknown>>): void;
  warn(message: string, context?: Readonly<Record<string, unknown>>): void;
}

export const logger: Logger = {
  error(message, context) {
    console.error(message, context ?? {});
  },
  warn(message, context) {
    console.warn(message, context ?? {});
  },
};
