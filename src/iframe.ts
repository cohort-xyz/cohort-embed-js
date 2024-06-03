import Logger from './logger';
import {buildCohortEmbedUrl, type EmbedUrlInputParams} from './url';

/**
 * Options for customizing the spinner.
 */
type SpinnerOptions = {
  backgroundColor?: string;
  color?: string;
};

/**
 * Options for configuring the iframe.
 */
export type IframeOptions = {
  containerId?: string;
  container?: HTMLElement;
  iframeStyle?: {
    width?: string;
    height?: string;
    border?: string;
  };
  spinnerStyle?: SpinnerOptions;
  pathname?: string;
  urlParams?: Omit<EmbedUrlInputParams, 'embedEmail'>;
};

/**
 * Represents a Cohort Iframe.
 */
class CohortIframe {
  #wrapper: HTMLDivElement;
  #iframe: HTMLIFrameElement;
  #spinner: HTMLDivElement;
  #url: URL;
  #logger: Logger;
  loaded = false;

  /**
   * Creates an instance of CohortIframe.
   * @param {string} userEmail - The email of the user.
   * @param {string} xpsOrigin - The origin URL for the XPS.
   * @param {IframeOptions} [options] - The options for the iframe.
   * @param {boolean} [verbose] - Whether to enable verbose logging.
   * @throws Will throw an error if the container with the specified ID is not found.
   */
  constructor(userEmail: string, xpsOrigin: string, options?: IframeOptions, verbose?: boolean) {
    const containerId = options?.containerId;
    const {iframeStyle} = options ?? {};

    if (options?.container && options?.containerId) {
      throw new Error('Cannot specify both container and containerId');
    }

    this.#logger = new Logger(verbose ?? false);
    this.#url = buildCohortEmbedUrl(
      xpsOrigin,
      {
        ...options?.urlParams,
        embedEmail: userEmail,
      },
      options?.pathname,
    );
    this.#wrapper = document.createElement('div');
    Object.assign(this.#wrapper.style, {
      position: 'relative',
      width: iframeStyle?.width ?? '100%',
      height: iframeStyle?.height ?? '100%',
      border: iframeStyle?.border ?? '0',
    });
    this.#spinner = this.#createSpinner(options?.spinnerStyle);
    this.#iframe = document.createElement('iframe');
    this.#iframe.style.width = '100%';
    this.#iframe.style.height = '100%';
    this.#iframe.style.border = '0';
    this.#iframe.loading = 'lazy';

    this.#wrapper.appendChild(this.#iframe);
    this.#wrapper.appendChild(this.#spinner);
    if (options?.container) {
      options.container.appendChild(this.#wrapper);
    } else if (containerId) {
      const container = document.getElementById(containerId);

      if (!container) {
        throw new Error(`Container with id ${containerId} not found`);
      }

      container.appendChild(this.#wrapper);
    } else {
      document.body.appendChild(this.#wrapper);
    }
  }

  /**
   * Creates a spinner element.
   * @param {SpinnerOptions} [options] - The options for the spinner.
   * @returns {HTMLDivElement} The spinner element.
   * @private
   */
  #createSpinner(options?: SpinnerOptions): HTMLDivElement {
    const spinnerContainer = document.createElement('div');

    Object.assign(spinnerContainer.style, {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: options?.backgroundColor ?? '#E8E9E8',
      zIndex: '9999',
    });
    const svgNS = 'http://www.w3.org/2000/svg';
    const spinner = document.createElementNS(svgNS, 'svg');

    Object.assign(spinner.style, {
      animation: 'sdk-spin 1s linear infinite',
      width: '24px',
      height: '24px',
      color: options?.color ?? '#000',
    });
    spinner.setAttribute('viewBox', '0 0 24 24');
    const circle = document.createElementNS(svgNS, 'circle');

    Object.assign(circle.style, {
      opacity: '0.2',
      stroke: 'currentColor',
      strokeWidth: '4',
      fill: 'none',
    });
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '12');
    circle.setAttribute('r', '10');
    const path = document.createElementNS(svgNS, 'path');

    Object.assign(path.style, {
      opacity: '1',
      fill: 'currentColor',
    });
    path.setAttribute(
      'd',
      'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
    );

    spinner.appendChild(circle);
    spinner.appendChild(path);
    spinnerContainer.appendChild(spinner);

    return spinnerContainer;
  }

  /**
   * Loads the iframe and executes a callback once the iframe is loaded.
   * @param {() => void} [callback] - The callback to execute once the iframe is loaded.
   */
  load(callback?: () => void) {
    this.#logger.log('Loading iframe', {
      url: this.#url.toString(),
    });
    this.#iframe.src = this.#url.toString();
    this.#iframe.onload = () => {
      this.#logger.log('Iframe loaded');
      this.loaded = true;
      callback?.();
    };
  }

  /**
   * Hides the spinner.
   */
  hideSpinner() {
    this.#logger.log('Hiding spinner');
    this.#spinner?.remove();
  }

  /**
   * Sends an authentication token to the iframe.
   * @param {string} authToken - The authentication token.
   */
  login(authToken: string) {
    this.#logger.log('Sending authToken...');
    this.#iframe.contentWindow?.postMessage(
      {
        event: 'login.authToken',
        payload: {
          authToken,
        },
      },
      this.#url.origin,
    );
  }

  navigateTo(pathname: string) {
    this.#logger.log('Navigating to', {
      pathname,
    });
    this.#iframe.contentWindow?.postMessage(
      {
        event: 'location.update',
        payload: {
          pathname,
        },
      },
      this.#url.origin,
    );
  }

  /**
   * Destroys the iframe and removes it from the DOM.
   */
  destroy() {
    this.#wrapper.remove();
  }
}

export default CohortIframe;
