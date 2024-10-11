import type {CohortXpsConfig, NavigationType, SupportedLanguage} from './types';

const allowedEmbedUrlParams: (keyof EmbedUrlParams)[] = [
  'customLoginUrl',
  'customLoginRedirectParameterName',
  'disableLogout',
  'embedded',
  'embedEmail',
  'embedUrl',
  'lng',
  'navbar',
  'navigationType',
];

type EmbedUrlParams = {
  customLoginUrl?: string;
  customLoginRedirectParameterName?: string;
  disableLogout: boolean;
  embedded: boolean;
  embedEmail?: string;
  embedUrl: string;
  lng?: SupportedLanguage;
  navbar?: boolean;
  navigationType?: NavigationType;
};

const validateEmbedUrlParams = (params: EmbedUrlParams): EmbedUrlParams => {
  for (const key of Object.keys(params)) {
    if (!allowedEmbedUrlParams.includes(key as keyof EmbedUrlParams)) {
      delete params[key as keyof EmbedUrlParams];
    }
  }
  return params;
};

export function formatPathname(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;

  return path;
}

export function buildCohortEmbedUrl(xpsUrl: string, config?: CohortXpsConfig): URL {
  const parentUrl = new URL(window.location.href);
  const cohortEmbedUrl = new URL(xpsUrl);
  const cohortRedirect = parentUrl.searchParams.get('cohortRedirect');
  const disableLogout = config?.auth?.authMode === 'custom';
  const embedEmail =
    config?.auth?.authMode === 'custom' ? config.auth.userEmail ?? undefined : undefined;
  const customLoginUrl =
    config?.auth?.authMode === 'custom' ? config?.auth?.customLoginUrl : undefined;
  const customLoginRedirectParameterName =
    config?.auth?.authMode === 'custom'
      ? config?.auth?.customLoginRedirectParameterName ?? 'destination'
      : undefined;
  let iframeParams = validateEmbedUrlParams({
    disableLogout,
    embedded: true,
    embedUrl: `${parentUrl.origin}${parentUrl.pathname}`,
    embedEmail,
    navbar: config?.showNavbar,
    navigationType: config?.navigationType,
    customLoginUrl,
    customLoginRedirectParameterName,
    lng: config?.language,
  });

  if (cohortRedirect) {
    const cohortRedirectUrl = new URL(cohortRedirect, cohortEmbedUrl.origin);

    cohortEmbedUrl.pathname = cohortRedirectUrl.pathname;
    iframeParams = {
      ...iframeParams,
      ...Object.fromEntries(cohortRedirectUrl.searchParams.entries()),
    };
    parentUrl.searchParams.delete('cohortRedirect');
    history.replaceState({}, '', parentUrl.toString());
  } else if (config?.pathname) {
    cohortEmbedUrl.pathname = formatPathname(config?.pathname);
  }

  for (const [key, value] of Object.entries(iframeParams)) {
    if (value !== undefined) {
      cohortEmbedUrl.searchParams.set(key, String(value));
    }
  }
  return cohortEmbedUrl;
}
