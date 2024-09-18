import CohortIframe from './iframe';
import Logger from './logger';
import {type BaseMessage, type Message, type MessageType, validateMessage} from './messaging';
import type {CohortXpsConfig, CustomAuthConfig} from './types';
import {buildCohortEmbedUrl} from './url';
import {isEmail} from './utils';

/**
 * Extracts the payload type from a message type.
 * @template T - The message type.
 */
type ExtractPayload<T extends MessageType> = Extract<Message, {event: T}>['payload'];

/**
 * Type for a message handler function.
 * @template T - The message type.
 * @param payload - The payload of the message.
 */
type MessageHandler<T extends MessageType> = (payload: ExtractPayload<T>) => void;

/**
 * SDK for integrating Cohort Experience Space embeds.
 */
class CohortSDK {
  #verbose: boolean;
  #logger: Logger;
  #xpsOrigin: string;
  #iframe: CohortIframe | null = null;
  #handlers: {[K in MessageType]?: Array<MessageHandler<K>>} = {};

  /**
   * Creates an instance of CohortSDK.
   * @param {string} xpsOrigin - Will be used as origin for the XPS iframe URL.
   * @param {boolean} [verbose] - Whether to enable verbose logging.
   * @throws Will throw an error if the XPS origin is an invalid URL.
   */
  constructor(xpsOrigin: string, verbose?: boolean) {
    try {
      this.#xpsOrigin = new URL(xpsOrigin).origin;
    } catch {
      throw new Error('Invalid XPS origin URL');
    }
    this.#verbose = verbose ?? false;
    this.#logger = new Logger(this.#verbose);
    this.#injectCSS();
    window.addEventListener('message', this.#handleMessage.bind(this));
  }

  /**
   * Injects the CSS needed for the SDK (currently the keyframes needed for animating the spinner).
   * @private
   */
  #injectCSS(): void {
    const keyframes = `
			@keyframes sdk-spin {
				to { transform: rotate(360deg); }
			}
		`;
    const styleSheet = document.createElement('style');

    styleSheet.innerText = keyframes;
    document.head.appendChild(styleSheet);
  }

  /**
   * Renders the Experience Space  in an iframe.
   * @param {CohortXpsConfig} config - The configuration for the Experience Space.
   */
  renderExperienceSpace(config?: CohortXpsConfig): void {
    const userEmail = config?.auth?.authMode === 'custom' ? config?.auth?.userEmail : null;

    if (userEmail !== null && !isEmail(userEmail)) {
      throw new Error('Invalid email');
    }

    if (config?.auth?.authMode === 'custom' && !config.auth?.getAuthToken) {
      throw new Error('Missing auth.getAuthToken function parameter');
    }

    if (config?.auth?.authMode === 'custom' && !config.auth?.customLoginUrl) {
      throw new Error('Missing auth.customLoginUrl parameter');
    }

    const url = buildCohortEmbedUrl(this.#xpsOrigin, config);
    const iframe = new CohortIframe(url, config?.iframeOptions, this.#verbose);

    if (this.#iframe !== null) {
      this.#iframe.destroy();
    }
    this.#iframe = iframe;

    iframe.load(async () => {
      let getAuthTokenCalled = false;
      let timeoutId: NodeJS.Timeout;

      if (userEmail === null) {
        const offAppLoaded = this.on('app.loaded', () => {
          this.#logger.log('App loaded');
          offAppLoaded();

          iframe.hideSpinner();
          if (config?.auth?.authMode === 'custom') {
            // Because of Cross Origin restrictions, the redirection must be done by the parent window
            // and not the iframe itself. This is why we emit an event to the parent window.
            const offAuthRedirect = this.on('auth.redirect', payload => {
              this.#logger.log('Redirecting to custom login URL', {
                url: payload.url,
              });
              window.location.assign(payload.url);
              offAuthRedirect();
            });
          }
        });
        return;
      }
      const authConfig = config?.auth as CustomAuthConfig;

      const offAuthUpdated = this.on('auth.updated', async payload => {
        if (payload.isLoggedIn) {
          this.#logger.log('User is logged in');
          offAuthUpdated();
          clearTimeout(timeoutId);
          iframe.hideSpinner();
          return;
        }

        if (!getAuthTokenCalled) {
          this.#logger.log('User is logged out, calling getAuthToken...');
          getAuthTokenCalled = true;
          timeoutId = setTimeout(() => {
            this.#logger.error('Took too long to validate login, timing out...');
            iframe.hideSpinner();
          }, 10000);
          const authToken = await authConfig.getAuthToken(userEmail);

          iframe.login(authToken);
        }
      });
    });
  }

  /**
   * Emits a message to the appropriate handlers.
   * @template T - The message type.
   * @param {BaseMessage<T, ExtractPayload<T>>} message - The message to emit.
   * @private
   */
  #emit<T extends MessageType>(message: BaseMessage<T, ExtractPayload<T>>) {
    const handlers = this.#handlers[message.event];

    if (handlers) {
      this.#logger.log('Received message', {
        event: message.event,
        payload: message.payload,
      });
      for (const handler of handlers) {
        handler(message.payload);
      }
    }
  }

  /**
   * Handles incoming messages from iframes.
   * @param {MessageEvent} event - The message event.
   * @private
   */
  #handleMessage(event: MessageEvent) {
    const message = event.data;

    if (validateMessage(message)) {
      this.#emit(message);
    }
  }

  /**
   * Registers a handler for a specific message type.
   * Possible message types:
   * - order.created
   * - order.error
   * - payment.failed
   * - location.updated
   * - auth.updated
   * @template T - The message type.
   * @param {T} event - The message type to handle.
   * @param {MessageHandler<T>} handler - The handler function.
   * @returns {() => void} A function to unregister the handler.
   */
  on<T extends MessageType>(event: T, handler: MessageHandler<T>): () => void {
    if (!this.#handlers[event]) {
      this.#handlers[event] = [];
    }
    // biome-ignore lint/style/noNonNullAssertion: TS doesn't understand that we're checking for the existence of the key
    this.#handlers[event]!.push(handler);

    return () => {
      this.#off(event, handler);
    };
  }

  /**
   * Unregisters a handler for a specific message type.
   * @template T - The message type.
   * @param {T} event - The message type.
   * @param {MessageHandler<T>} handler - The handler function.
   * @private
   */
  #off<T extends MessageType>(event: T, handler: MessageHandler<T>) {
    const handlers = this.#handlers[event];

    if (handlers) {
      this.#handlers[event] = handlers.filter(h => h !== handler) as typeof handlers;
      if (this.#handlers[event]?.length === 0) {
        delete this.#handlers[event];
      }
    }
  }

  /**
   * Navigates the iframe to a specific path.
   * @param {string} path - The path to navigate to.
   * @throws Will throw an error if there is no iframe to navigate.
   */
  navigateTo(path: string) {
    if (!this.#iframe) {
      throw new Error('Cannot navigate without an iframe');
    }
    this.#iframe.navigateTo(path);
  }

  /**
   * Destroys the SDK instance, cleaning up iframes and event listeners.
   */
  destroy() {
    this.#logger.log('Destroying SDK instance');
    if (this.#iframe) {
      this.#iframe.destroy();
    }
    window.removeEventListener('message', this.#handleMessage);
  }
}

export default CohortSDK;
