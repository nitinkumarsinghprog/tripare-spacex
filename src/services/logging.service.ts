type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, message: string, context?: unknown): void {
  const timestamp = new Date().toISOString();

  const prefix = `[Tripare][${level.toUpperCase()}][${timestamp}]`;

  if (level === "error") {
    console.error(prefix, message, context);
    return;
  }

  if (level === "warn") {
    console.warn(prefix, message, context);
    return;
  }

  console.info(prefix, message, context);
}

export const logger = {
  info(message: string, context?: unknown): void {
    log("info", message, context);
  },

  warn(message: string, context?: unknown): void {
    log("warn", message, context);
  },

  error(message: string, context?: unknown): void {
    log("error", message, context);
  },
};
