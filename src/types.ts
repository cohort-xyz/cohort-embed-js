/**
 * Options for customizing the spinner.
 */
export type SpinnerOptions = {
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
};

/**
 * Configuration for custom authentication.
 * @param authMode - The type of authentication to use. Must be 'custom'.
 * @param userEmail - The email of the user currently logged in. If the user is not logged in, this should be null.
 * @param getAuthToken - A function that will be called when we need to retrieve an authentication token for the logged in user.
 *    This function should fetch the token from the Cohort Merchants API /v1/users/auth-token endpoint.
 *    For security reason, this API call should be proxied through your backend.
 * @param customLoginUrl - The URL of the custom login page. When the user is not logged in and trying to access a protected page, they will be redirected to this URL.
 * @param customLoginRedirectParameterName - The URL parameter to use for the redirect URL after login. Defaults to 'destination'.
 */
export type CustomAuthConfig = {
  authMode: 'custom';
  userEmail: string | null;
  getAuthToken: (userEmail: string) => Promise<string>;
  customLoginUrl: string;
  customLoginRedirectParameterName?: string;
};

/**
 * Configuration for Cohort authentication.
 */
export type CohortAuthConfig = {
  authMode: 'cohort';
};

/**
 * Options for rendering the Cohort Experience Space.
 * @param auth - The configuration of the user authentication. There are 2 possible types of configurations:
 * - CustomAuthConfig: The user is authenticated by the parent application and the user credentials are passed to the SDK.
 * - CohortAuthConfig: The user is authenticated using the built-in Cohort authentication system inside the iframe.
 * By default the CohortAuthConfig is used.
 * @param iframeOptions - The options for the iframe.
 * @param pathname - The path to load inside the iframe. Defaults to the home page.
 * @param showNavbar - Whether to show the navbar inside the iframe. Defaults to true.
 * @param navigationType - The type of navigation menu to use inside the iframe. Defaults to 'tabbar'.
 */
export type CohortXpsConfig = {
  auth?: CustomAuthConfig | CohortAuthConfig;
  iframeOptions?: IframeOptions;
  pathname?: string;
  showNavbar?: boolean;
  navigationType?: 'burger' | 'tabbar';
};
