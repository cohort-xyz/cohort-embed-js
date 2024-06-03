import type {IframeOptions} from './iframe';
import CohortIframe from './iframe';
import Logger from './logger';
import {validateMessage, type BaseMessage, type Message, type MessageType} from './messaging';
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
  #iframes: CohortIframe[] = [];
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
   * Renders the Experience Space iframe. Only one iframe can be rendered at a time for the moment.
   * Will call getAuthToken if the user is logged out, otherwise will preserve the login state of the Experience Space
   * if the logged in user matches the provided email.
   * @param {string} userEmail - The email of the user to render the iframe for.
   * @param {IframeOptions} options - The options for the iframe.
   * @param {() => Promise<string>} getAuthToken - A function to get the authentication token if the user is logged out.
   * @throws Will throw an error if the email is invalid.
   */
  renderExperienceSpace(
    userEmail: string,
    options: IframeOptions,
    getAuthToken: () => Promise<string>,
  ): void {
    if (!isEmail(userEmail)) {
      throw new Error('Invalid email');
    }
    const iframe = new CohortIframe(userEmail, this.#xpsOrigin, options, this.#verbose);

    // TODO: once we fix the issue with firebase authentication in multiple frames
    // we can allow multiple iframes to be rendered
    // this.#iframes.push(iframe);
    for (const iframe of this.#iframes) {
      iframe.destroy();
    }
    this.#iframes = [iframe];

    if (this.#iframes.length === 1) {
      iframe.load(async () => {
        let getAuthTokenCalled = false;
        let timeoutId: NodeJS.Timeout;

        const unsubscribe = this.on('auth.updated', async payload => {
          if (payload.isLoggedIn) {
            this.#logger.log('User is logged in');
            unsubscribe();
            clearTimeout(timeoutId);
            for (const iframe of this.#iframes) {
              if (!iframe.loaded) {
                iframe.load();
              }
              iframe.hideSpinner();
            }
            return;
          }

          if (!getAuthTokenCalled) {
            this.#logger.log('User is logged out, calling getAuthToken...');
            getAuthTokenCalled = true;
            timeoutId = setTimeout(() => {
              this.#logger.error('Took too long to validate login, timing out...');
              iframe.hideSpinner();
            }, 10000);
            const authToken = await getAuthToken();

            iframe.login(authToken);
          }
        });
      });
    }
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
    const iframe = this.#iframes[0];

    if (!iframe) {
      throw new Error('Cannot navigate without an iframe');
    }
    iframe.navigateTo(path);
  }

  /**
   * Destroys the SDK instance, cleaning up iframes and event listeners.
   */
  destroy() {
    this.#logger.log('Destroying SDK instance');
    for (const iframe of this.#iframes) {
      iframe.destroy();
    }
    window.removeEventListener('message', this.#handleMessage);
  }
}

export default CohortSDK;
