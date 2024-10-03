import {fireEvent, waitFor} from '@testing-library/dom';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import CohortSDK from '../src/index';
import type {MessageType} from '../src/messaging';

describe('CohortSDK', () => {
  const userEmail = 'test-sdk@getcohort.com';
  let sdk: CohortSDK;

  beforeEach(() => {
    sdk = new CohortSDK('https://testouze.com', false);
  });

  afterEach(() => {
    sdk.destroy();
  });

  it('should throw an error if the xps origin is not a valid URL', () => {
    expect(() => new CohortSDK('invalid-url')).toThrowError('Invalid XPS origin URL');
  });

  it('should inject CSS for spinner animation', () => {
    const style = document.querySelector('style');

    expect(style).not.toBeNull();
    expect(style?.innerText).toContain('@keyframes sdk-spin');
  });

  describe('renderExperienceSpace', () => {
    describe('with custom login', () => {
      it('should throw an error if the email is invalid', () => {
        const getAuthToken = vi.fn();

        expect(() =>
          sdk.renderExperienceSpace({
            auth: {
              authMode: 'custom',
              userEmail: 'invalid-email',
              customLoginUrl: 'https//testouze.com/login',
              getAuthToken,
            },
          }),
        ).toThrowError('Invalid email');
      });

      it('should throw an error if getAuthToken function is missing', () => {
        expect(() =>
          sdk.renderExperienceSpace({
            // @ts-expect-error - Missing getAuthToken function
            auth: {
              authMode: 'custom',
              userEmail,
              customLoginUrl: 'https//testouze.com/login',
            },
          }),
        ).toThrowError('Missing auth.getAuthToken function parameter');
      });

      it('should throw an error if customLoginUrl is missing', () => {
        const getAuthToken = vi.fn();

        expect(() =>
          sdk.renderExperienceSpace({
            // @ts-expect-error - Missing customLoginUrl parameter
            auth: {
              authMode: 'custom',
              userEmail,
              getAuthToken,
            },
          }),
        ).toThrowError('Missing auth.customLoginUrl parameter');
      });

      it('should render a space iframe and call getAuthToken if user is logged out', async () => {
        const getAuthToken = vi.fn().mockResolvedValue('test-token');
        const container = document.createElement('div');
        const containerId = 'test-container';

        container.id = containerId;
        document.body.appendChild(container);

        sdk.renderExperienceSpace({
          auth: {
            authMode: 'custom',
            userEmail,
            getAuthToken,
            customLoginUrl: 'https://testouze.com/login',
          },
          iframeOptions: {
            container,
            iframeStyle: {
              width: '400px',
            },
            spinnerStyle: {
              backgroundColor: 'red',
              color: 'blue',
            },
          },
          pathname: '/space/rewards',
          showNavbar: false,
          navigationType: 'burger',
          language: 'fr',
        });
        const iframe = document.querySelector('iframe');

        expect(iframe).not.toBeNull();
        expect(iframe?.style.width).toBe('100%');
        expect(iframe?.style.height).toBe('100%');
        const wrapper = iframe?.parentElement;
        const spinner = iframe?.nextElementSibling;

        expect(wrapper?.parentElement?.id).toBe(containerId);
        expect(wrapper?.style.width).toBe('400px');
        expect(wrapper?.style.height).toBe('100%');
        expect(spinner).not.toBeNull();
        const spinnerSvg = spinner?.querySelector('svg');

        expect(spinnerSvg).not.toBeNull();

        // biome-ignore lint/style/noNonNullAssertion:
        fireEvent.load(iframe!);
        await waitFor(() => {
          const url = new URL(iframe?.src ?? '');

          expect(url.origin).toBe('https://testouze.com');
          expect(url.pathname).toBe('/space/rewards');
          expect(url.searchParams.get('embedEmail')).toBe(userEmail);
          expect(url.searchParams.get('disableLogout')).toBe('true');
          expect(url.searchParams.get('embedded')).toBe('true');
          expect(url.searchParams.get('embedUrl')).toBe('http://localhost:3000/');
          expect(url.searchParams.get('navbar')).toBe('false');
          expect(url.searchParams.get('navigationType')).toBe('burger');
          expect(url.searchParams.get('notAuthorizedParam')).toBeNull();
          expect(url.searchParams.get('lng')).toBe('fr');
        });
        const logoutMessageEvent = new MessageEvent('message', {
          data: {event: 'auth.updated', payload: {isLoggedIn: false}},
        });

        window.dispatchEvent(logoutMessageEvent);
        await waitFor(() => expect(getAuthToken).toHaveBeenCalled());
        const postMessageMock = vi.fn();

        // biome-ignore lint/style/noNonNullAssertion:
        iframe!.contentWindow!.postMessage = postMessageMock;
        await waitFor(() => {
          expect(postMessageMock).toHaveBeenCalledWith(
            {event: 'login.authToken', payload: {authToken: 'test-token'}},
            'https://testouze.com',
          );
        });
        const loginMessageEvent = new MessageEvent('message', {
          data: {event: 'auth.updated', payload: {isLoggedIn: true}},
        });

        window.dispatchEvent(loginMessageEvent);
        await waitFor(() => {
          const iframe = document.querySelector('iframe');
          const spinner = iframe?.nextElementSibling;

          expect(spinner).toBeNull();
        });
      });

      it('should render a space iframe and not call getAuthToken if user is logged in', async () => {
        const getAuthToken = vi.fn().mockResolvedValue('test-token');
        const container = document.createElement('div');
        const containerId = 'test-container';

        container.id = containerId;
        document.body.appendChild(container);

        sdk.renderExperienceSpace({
          auth: {
            authMode: 'custom',
            userEmail,
            getAuthToken,
            customLoginUrl: 'https://testouze.com/login',
          },
        });
        const iframe = document.querySelector('iframe');

        expect(iframe).not.toBeNull();
        const postMessageMock = vi.fn();

        // biome-ignore lint/style/noNonNullAssertion:
        iframe!.contentWindow!.postMessage = postMessageMock;
        const loginMessageEvent = new MessageEvent('message', {
          data: {event: 'auth.updated', payload: {isLoggedIn: true}},
        });

        window.dispatchEvent(loginMessageEvent);
        await waitFor(() => {
          expect(getAuthToken).not.toHaveBeenCalled();
          expect(postMessageMock).not.toHaveBeenCalled();
        });
      });

      it('should disable logout', async () => {
        const getAuthToken = vi.fn();

        sdk.renderExperienceSpace({
          auth: {
            authMode: 'custom',
            userEmail,
            customLoginUrl: 'https//testouze.com/login',
            getAuthToken,
          },
        });
        const iframe = document.querySelector('iframe');

        expect(iframe).not.toBeNull();
        // biome-ignore lint/style/noNonNullAssertion:
        fireEvent.load(iframe!);
        await waitFor(() => {
          const url = new URL(iframe?.src ?? '');

          expect(url.searchParams.get('disableLogout')).toBe('true');
        });
      });

      it('should set custom login redirect parameter if specified', async () => {
        const getAuthToken = vi.fn();

        sdk.renderExperienceSpace({
          auth: {
            authMode: 'custom',
            userEmail,
            customLoginUrl: 'https//testouze.com/login',
            getAuthToken,
            customLoginRedirectParameterName: 'redirectUri',
          },
        });
        const iframe = document.querySelector('iframe');

        expect(iframe).not.toBeNull();
        // biome-ignore lint/style/noNonNullAssertion:
        fireEvent.load(iframe!);
        await waitFor(() => {
          const url = new URL(iframe?.src ?? '');

          expect(url.searchParams.get('customLoginRedirectParameterName')).toBe('redirectUri');
        });
      });

      it('should render a space iframe and wait for app.loaded event if no email is provided', async () => {
        const getAuthToken = vi.fn().mockResolvedValue('test-token');
        const container = document.createElement('div');
        const containerId = 'test-container';

        container.id = containerId;
        document.body.appendChild(container);

        sdk.renderExperienceSpace({
          auth: {
            authMode: 'custom',
            userEmail: null,
            getAuthToken,
            customLoginUrl: 'https://testouze.com/login',
          },
          iframeOptions: {
            container,
            iframeStyle: {
              width: '400px',
            },
            spinnerStyle: {
              backgroundColor: 'red',
              color: 'blue',
            },
          },
          pathname: '/store/test-store',
        });
        const iframe = document.querySelector('iframe');
        const spinner = iframe?.nextElementSibling;

        expect(spinner).not.toBeNull();

        // biome-ignore lint/style/noNonNullAssertion:
        fireEvent.load(iframe!);
        await waitFor(() => {
          const url = new URL(iframe?.src ?? '');

          expect(url.origin).toBe('https://testouze.com');
          expect(url.pathname).toBe('/store/test-store');
          expect(url.searchParams.get('embedEmail')).toBe(null);
          expect(url.searchParams.get('disableLogout')).toBe('true');
          expect(url.searchParams.get('embedded')).toBe('true');
          expect(url.searchParams.get('embedUrl')).toBe('http://localhost:3000/');
          expect(url.searchParams.get('lng')).toBeNull();
        });
        const appLoadedMessageEvent = new MessageEvent('message', {
          data: {event: 'app.loaded', payload: {}},
        });
        const authRedirectMessageEvent = new MessageEvent('message', {
          data: {event: 'auth.redirect', payload: {url: 'https://testouze.com/login'}},
        });
        const assignMock = vi.fn();
        const {location} = window;

        // Mock window.location.assign to track the redirect
        window.location = {assign: assignMock} as unknown as Location;
        window.dispatchEvent(appLoadedMessageEvent);
        window.dispatchEvent(authRedirectMessageEvent);
        await waitFor(() => {
          const iframe = document.querySelector('iframe');
          const spinner = iframe?.nextElementSibling;

          expect(spinner).toBeNull();
          expect(assignMock).toHaveBeenCalledWith('https://testouze.com/login');
        });
        // Restore window.location
        window.location = location;
      });
    });

    describe('with cohort login', () => {
      it('should not set custom login parameters and wait for app.loaded event', async () => {
        sdk.renderExperienceSpace({
          auth: {
            authMode: 'cohort',
          },
        });
        const iframe = document.querySelector('iframe');
        const spinner = iframe?.nextElementSibling;

        expect(iframe).not.toBeNull();
        expect(spinner).not.toBeNull();
        // biome-ignore lint/style/noNonNullAssertion:
        fireEvent.load(iframe!);
        await waitFor(() => {
          const url = new URL(iframe?.src ?? '');

          expect(url.origin).toBe('https://testouze.com');
          expect(url.searchParams.get('embedEmail')).toBeNull();
          expect(url.searchParams.get('customLoginUrl')).toBeNull();
          expect(url.searchParams.get('customLoginRedirectParameterName')).toBeNull();
          expect(url.searchParams.get('disableLogout')).toBe('false');
          expect(url.searchParams.get('embedded')).toBe('true');
          expect(url.searchParams.get('embedUrl')).toBe('http://localhost:3000/');
        });

        const appLoadedMessageEvent = new MessageEvent('message', {
          data: {event: 'app.loaded', payload: {}},
        });

        window.dispatchEvent(appLoadedMessageEvent);
        await waitFor(() => {
          const iframe = document.querySelector('iframe');
          const spinner = iframe?.nextElementSibling;

          expect(spinner).toBeNull();
        });
      });
    });

    it('should default to cohort login', async () => {
      sdk.renderExperienceSpace();

      const iframe = document.querySelector('iframe');
      expect(iframe).not.toBeNull();

      // biome-ignore lint/style/noNonNullAssertion:
      fireEvent.load(iframe!);
      await waitFor(() => {
        const url = new URL(iframe?.src ?? '');

        expect(url.origin).toBe('https://testouze.com');
        expect(url.searchParams.get('embedEmail')).toBeNull();
        expect(url.searchParams.get('customLoginUrl')).toBeNull();
        expect(url.searchParams.get('customLoginRedirectParameterName')).toBeNull();
        expect(url.searchParams.get('disableLogout')).toBe('false');
        expect(url.searchParams.get('embedded')).toBe('true');
        expect(url.searchParams.get('embedUrl')).toBe('http://localhost:3000/');
      });
    });

    it('should throw an error if the container with the specified ID is not found', () => {
      expect(() =>
        sdk.renderExperienceSpace({iframeOptions: {containerId: 'invalid-id'}}),
      ).toThrowError('Container with id invalid-id not found');
    });

    it('should throw an error if both container and containerId are specified', () => {
      expect(() =>
        sdk.renderExperienceSpace({
          iframeOptions: {container: document.createElement('div'), containerId: 'test-id'},
        }),
      ).toThrowError('Cannot specify both container and containerId');
    });

    it('should render a space iframe and only one', async () => {
      const container = document.createElement('div');

      container.id = 'test-container';
      document.body.appendChild(container);
      sdk.renderExperienceSpace({
        iframeOptions: {
          container,
        },
      });
      const iframe = document.querySelector('iframe');

      expect(iframe).not.toBeNull();
      const wrapper = iframe?.parentElement;

      expect(wrapper?.parentElement).toBe(container);
      expect(iframe?.style.width).toBe('100%');
      expect(iframe?.style.height).toBe('100%');
      expect(wrapper?.style.width).toBe('100%');
      expect(wrapper?.style.height).toBe('100%');

      // biome-ignore lint/style/noNonNullAssertion:
      fireEvent.load(iframe!);
      await waitFor(() => {
        const url = new URL(iframe?.src ?? '');

        expect(url.origin).toBe('https://testouze.com');
        expect(url.searchParams.get('embedded')).toBe('true');
        expect(url.searchParams.get('embedUrl')).toBe('http://localhost:3000/');
      });

      sdk.renderExperienceSpace({
        iframeOptions: {
          container,
        },
      });
      const iframes = document.querySelectorAll('iframe');

      expect(iframes.length).toBe(1);
    });
  });

  describe('on', () => {
    it('should subscribe to events and call the callback', async () => {
      const callback = vi.fn();
      const events: Record<MessageType, unknown> = {
        'auth.updated': {isLoggedIn: true},
        'order.created': {orderId: 'test-order-id'},
        'payment.failed': {paymentSessionId: 'test-payment-session-id'},
        'location.updated': {location: 'test-location'},
        // @ts-expect-error - This event is not supported and should be ignored
        'not.supported': {},
      };

      for (const [event, payload] of Object.entries(events)) {
        sdk.on(event as MessageType, callback);
        const messageEvent = new MessageEvent('message', {
          data: {event, payload},
        });

        window.dispatchEvent(messageEvent);
        if (event === 'not.supported') {
          await waitFor(() => expect(callback).not.toHaveBeenCalled());
          continue;
        }
        await waitFor(() => {
          expect(callback).toHaveBeenCalledWith(messageEvent.data.payload);
          vi.clearAllMocks();
        });
      }
    });

    it('should unsubscribe from event', async () => {
      const callback = vi.fn();

      const off = sdk.on('auth.updated', callback);
      const messageEvent = new MessageEvent('message', {
        data: {event: 'auth.updated', payload: {isLoggedIn: true}},
      });

      window.dispatchEvent(messageEvent);
      await waitFor(() => expect(callback).toHaveBeenCalled());
      off();
      vi.clearAllMocks();
      window.dispatchEvent(messageEvent);
      await waitFor(() => expect(callback).not.toHaveBeenCalled());
    });
  });

  describe('navigateTo', () => {
    it('should throw an error if trying to navigate without an iframe being rendered', () => {
      expect(() => sdk.navigateTo('/test')).toThrowError('Cannot navigate without an iframe');
    });

    it('should navigate to a new pathname', async () => {
      sdk.renderExperienceSpace();
      const iframe = document.querySelector('iframe');

      expect(iframe).not.toBeNull();
      const postMessageMock = vi.fn();

      // biome-ignore lint/style/noNonNullAssertion:
      iframe!.contentWindow!.postMessage = postMessageMock;
      sdk.navigateTo('/test');
      await waitFor(() => {
        expect(postMessageMock).toHaveBeenCalledWith(
          {event: 'location.update', payload: {pathname: '/test'}},
          'https://testouze.com',
        );
      });
    });
  });

  describe('destroy', () => {
    it('should clean up iframes and remove listeners on destroy', async () => {
      sdk.renderExperienceSpace();
      const iframe = document.querySelector('iframe');

      expect(iframe).not.toBeNull();
      sdk.destroy();
      const iframeAfterDestroy = document.querySelector('iframe');

      await waitFor(() => expect(iframeAfterDestroy).toBeNull());
    });
  });
});
