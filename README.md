# Cohort Embed JS SDK

![npm](https://img.shields.io/npm/v/@cohort-xyz/cohort-embed-js)
![npm bundle size](https://img.shields.io/bundlephobia/min/@cohort-xyz/cohort-embed-js)

---

[Cohort](https://getcohort.com/) is the Plug and Play marketing solution that turns the customer account into a powerful engagement channel for brands.

---

Cohort Embed JS SDK is a JavaScript SDK for integrating Cohort Experience Space embeds into your web application. It provides an easy way to render iframes, manage user authentication, and handle messages from the embedded iframes.

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
const userEmail = 'user@example.com';
const options = {
  containerId: 'container',
};
const getAuthToken = async () => {
  // Your logic to get the authentication token from your backend
  return 'your-auth-token';
};

cohort.renderExperienceSpace(userEmail, options, getAuthToken);
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

- `renderExperienceSpace(userEmail: string, options: IframeOptions, getAuthToken: () => Promise<string>)`: Renders the Experience Space iframe. **For the moment, it's only possible to render one Iframe at a time. Multiple calls to this method will replace the existing iframe.**

  - `userEmail`: The email of the logged in user.
  - `options`: The options for the iframe.
  - `getAuthToken`: A function to get the authentication token if the user is logged out. Here you should put the logic to get a Cohort authentication token from your backend which should use the Cohort Public API.

Here's the complete list of options:

| Option                            | Default       | Description                                                                                                                                                 |
| --------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **containerId**                   | `undefined`   | The id of the DOM element where the Iframe will be append to. If neither `containerId` nor `container` are provided, it will be append directly in the DOM. |
| **container**                     | `undefined`   | The DOM element where the Iframe will be append to. If neither `containerId` nor `container` are provided, it will be append directly in the DOM.           |
| **pathName**                      | `/space/home` | The path of the Experience Space.                                                                                                                           |
| **iframeStyle?.width**            | `100%`        | The width property of the Iframe                                                                                                                            |
| **iframeStyle?.height**           | `100%`        | The height property of the Iframe                                                                                                                           |
| **iframeStyle?.border**           | `0`           | The border property of the Iframe                                                                                                                           |
| **spinnerStyle?.color**           | `#000`        | The color of the spinner                                                                                                                                    |
| **spinnerStyle?.backgroundColor** | `#E8E9E8`     | The background color of the spinner                                                                                                                         |
| **urlParams?.disableLogout**      | `true`        | Whether to display the logout button in the Experience Space                                                                                                |
| **urlParams?.navbar**             | `true`        | Whether to display the navbar in the Experience Space                                                                                                       |
| **urlParams?.navigationType**     | `tabbar`      | The navigation type of the Experience Space for mobile devices. Possible values: `tabbar` or `burger`                                                       |

- `on<T extends MessageType>(event: T, handler: MessageHandler<T>): () => void`: Registers a handler for a specific message type.

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
