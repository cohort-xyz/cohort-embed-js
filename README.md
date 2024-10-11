# Cohort Embed JS SDK

[![npm](https://img.shields.io/npm/v/@cohort-xyz/cohort-embed-js)](https://www.npmjs.com/package/@cohort-xyz/cohort-embed-js)
![npm bundle size](https://img.shields.io/bundlephobia/min/@cohort-xyz/cohort-embed-js)

---

[Cohort](https://getcohort.com/) is the Plug and Play marketing solution that turns the customer account into a powerful engagement channel for brands.

---

Cohort Embed JS SDK is a JavaScript SDK for integrating Cohort Experience Space embeds into your web application. It provides an easy way to render iframe, manage user authentication, and handle messages from the embedded iframe.

Find all the Cohort's documentation at [docs.getcohort.com](https://docs.getcohort.com/).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Rendering the Experience Space](#rendering-the-experience-space)
  - [Handling Messages](#handling-messages)
- [API](#api)
  - [Methods](#methods)
- [Examples](#examples)
- [Development](#development)
- [License](#license)

## Installation

Via NPM:

```sh
npm install @cohort-xyz/cohort-embed-js
```

Via PNPM:

```sh
pnpm add @cohort-xyz/cohort-embed-js
```

Via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@cohort-xyz/cohort-embed-js"></script>
```

## Usage

### Initialization

First, you need to import and initialize the SDK:

```javascript
import CohortSDK from '@cohort-xyz/cohort-embed-js';

const cohort = new CohortSDK('https://your-xps-origin.com');
```

### Rendering the Experience Space

To render the Experience Space iframe, you need to call the `renderExperienceSpace` method:

```javascript
sdk.renderExperienceSpace({
  // See after for the available options and explanations
  auth: {
    authMode: 'cohort',
  },
  iframeOptions: {
    containerId: 'container',
  },
});
```

### Handling Messages

You can register handlers for specific message types using the `on` method:

```javascript
// Possible message types:
// - order.created
// - order.error
// - payment.failed
// - location.updated
// - auth.updated
cohort.on('auth.updated', (payload) => {
  console.log('Auth updated:', payload);
});
```

### Navigation

You can navigate to a specific page in the Experience Space using the `navigateTo` method:

```javascript
cohort.navigateTo('/space/journeys');
```

## API

### CohortSDK

The main class for interacting with the Cohort Experience Space.

#### Methods

- `constructor(xpsOrigin: string, verbose?: boolean)`: Creates an instance of CohortSDK.

  - `xpsOrigin`: The origin URL for the XPS iframe.
  - `verbose`: Whether to enable verbose logging.

- `renderExperienceSpace(config?: CohortXpsConfig)`: Renders the Experience Space in an iframe.

  - `config`: The configuration for the Experience Space.

### Authentication

The Experience Space supports 2 modes of authentication:

- `cohort` (Default): The session of the user is managed by Cohort. The user will be required to login and logout inside the iframe using their email address. This is the simplest authentication mode. Use this if you don't have an existing user authentication system, or if you don't want to integrate Cohort with it. Sessions will be cached automatically inside the iframe (so the user won't need to sign-in again if they have signed-in in the past on the same browser).
- `custom`: You are in charge of managing the session of the user. You must provide the following parameters:

  - `userEmail`: The email of the user currently logged-in in your application (or null, if the user is logged out)
  - `getAuthToken`: A function that you must implement to retrieve the Cohort authToken for the currently logged-in user using the Cohort Merchants API. This function will be called by the SDK when we need an authentication token to sign the user in the iframe.
  - `customLoginUrl`: The URL of your application authentication page. If you allow logged-out users to see the Experience Space, they will be redirected to this URL when they try to access a protected page. The URL of the page the user must be redirected to after login will be passed as a parameter. For the best user experience, we recommend that your authentication page supports it and redirects the user to it after login.
  - `customLoginRedirectParameterName`: The name of the URL parameter that will contain the URL to redirect the user after login. By default, it is `destination`.

  With the `custom` auth mode, the SDK will take care of knowing when the user is authenticated inside the iframe and will only request an auth-token when needed, so there is no need for you to implement any session caching.

### Other options

You can also specify other options to configure the iframe and the behavior of the Experience Space:

| Option                                          | Default       | Description                                                                                                                                                                                                                           |
| ----------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **iframeOptions.containerId**                   | `undefined`   | The id of the DOM element where the Iframe will be append to. If neither `iframeOptions.containerId` nor `iframeOptions.container` are provided, it will be append directly in the DOM.                                               |
| **iframeOptions.container**                     | `undefined`   | The DOM element where the Iframe will be append to. If neither `iframeOptions.containerId` nor `iframeOptions.container` are provided, it will be append directly in the DOM.                                                         |
| **iframeOptions.iframeStyle?.width**            | `100%`        | The width property of the Iframe                                                                                                                                                                                                      |
| **iframeOptions.iframeStyle?.height**           | `100%`        | The height property of the Iframe                                                                                                                                                                                                     |
| **iframeOptions.iframeStyle?.border**           | `0`           | The border property of the Iframe                                                                                                                                                                                                     |
| **iframeOptions.spinnerStyle?.color**           | `#000`        | The color of the spinner                                                                                                                                                                                                              |
| **iframeOptions.spinnerStyle?.backgroundColor** | `#E8E9E8`     | The background color of the spinner                                                                                                                                                                                                   |
| **pathname**                                    | `/space/home` | The path to load in the iframe. Default to the home page.                                                                                                                                                                             |
| **showNavbar**                                  | `true`        | Whether to display the navbar in the Experience Space                                                                                                                                                                                 |
| **navigationType**                              | `tabbar`      | The navigation type of the Experience Space (mostly for mobile devices). Possible values: `tabbar`, `burger`, `none`                                                                                                                  |
| **language**                                    | `undefined`   | The language of the Experience Space. Default to the user's preference or browser's language if there's no user. Possible values: `ar`,`zh`,`cs`,`nl`,`en`,`fr`,`de`,`el`,`id`,`it`,`ja`,`ko`,`fa`,`pl`,`pt`,`ru`,`es`,`tr`,`uk`,`vi` |

- `on<T extends MessageType(event: T, handler: MessageHandler<T>): () => void`: Registers a handler for a specific message type.

  - `event`: The message type to handle.
  - `handler`: The handler function.
  - Returns: A function to unregister the handler.

| Message Type         | Payload                      | Description                                           |
| -------------------- | ---------------------------- | ----------------------------------------------------- |
| **order.created**    | `{orderId: string}`          | Triggered after a successful order on a Store page.   |
| **order.error**      | `{error: string}`            | Triggered after a failed order on a Store page.       |
| **payment.failed**   | `{paymentSessionId: string}` | Triggered after a failed payment on a Store page.     |
| **location.updated** | `{location: string}`         | Triggered after the location is updated.              |
| **auth.updated**     | `{isLoggedIn: boolean}`      | Triggered after the authentication status is updated. |

- `navigateTo(path: string)`: Navigates to a specific page in the Experience Space.

- `destroy()`: Destroys the SDK instance, cleaning up iframes and event listeners.

## Examples

- [Vanilla JS Example](examples/vanilla-js/README.md)
- [React Example](examples/react/README.md)
- [CDN Example](examples/cdn/README.md)

## Development

```sh
pnpm install
pnpm dev
pnpm test
```

## License

This project is licensed under the MIT license.

See [LICENSE](LICENSE) for more information.
