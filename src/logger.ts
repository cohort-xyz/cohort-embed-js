/**
 * Logger class for logging messages with optional metadata.
 */
class Logger {
  #enabled: boolean;

  /**
   * Creates an instance of Logger.
   * @param {boolean} enabled - Whether logging is enabled.
   */
  constructor(enabled: boolean) {
    this.#enabled = enabled;
  }

  /**
   * Formats the log message.
   * @param {string} message - The message to format.
   * @returns {string} The formatted message.
   * @private
   */
  #formatMessage(message: string): string {
    return `[SDK] - ${message}`;
  }

  /**
   * Outputs a log or error message to the console.
   * @param {'log' | 'error'} method - The console method to use.
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [metadata] - Optional metadata to include with the message.
   * @private
   */
  #output(method: 'log' | 'error', message: string, metadata?: Record<string, unknown>): void {
    if (!this.#enabled) {
      return;
    }
    console[method](this.#formatMessage(message), metadata ?? {});
  }

  /**
   * Logs a message with optional metadata.
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [metadata] - Optional metadata to include with the message.
   */
  log(message: string, metadata?: Record<string, unknown>): void {
    this.#output('log', message, metadata);
  }

  /**
   * Logs an error message with optional metadata.
   * @param {string} message - The error message to log.
   * @param {Record<string, unknown>} [metadata] - Optional metadata to include with the message.
   */
  error(message: string, metadata?: Record<string, unknown>): void {
    this.#output('error', message, metadata);
  }
}

export default Logger;
