// The goal is also to expose this function in the documentation for merchants integration

const allowedEmbedUrlParams = ['disableLogout', 'embedEmail', 'navbar', 'navigationType'];

export type EmbedUrlInputParams = {
  disableLogout?: boolean;
  embedEmail: string;
  navbar?: boolean;
  navigationType?: 'burger' | 'tabbar';
};

type EmbedUrlParams = EmbedUrlInputParams & {
  embedUrl: string;
  embedded: boolean;
};

const validateEmbedUrlParams = (params: EmbedUrlInputParams): EmbedUrlInputParams => {
  for (const key of Object.keys(params)) {
    if (!allowedEmbedUrlParams.includes(key)) {
      delete params[key as keyof EmbedUrlInputParams];
    }
  }
  return params;
};

export function buildCohortEmbedUrl(
  xpsUrl: string | URL,
  params: EmbedUrlInputParams,
  pathname?: string,
): URL {
  const parentUrl = new URL(window.location.href);
  const cohortEmbedUrl = new URL(xpsUrl.toString());
  const cohortRedirect = parentUrl.searchParams.get('cohortRedirect');
  let iframeParams = {
    disableLogout: true,
    embedUrl: `${parentUrl.origin}${parentUrl.pathname}`,
    embedded: true,
    ...validateEmbedUrlParams(params),
  } satisfies EmbedUrlParams;

  if (cohortRedirect) {
    const cohortRedirectUrl = new URL(cohortRedirect, cohortEmbedUrl.origin);

    cohortEmbedUrl.pathname = cohortRedirectUrl.pathname;
    iframeParams = {
      ...iframeParams,
      ...Object.fromEntries(cohortRedirectUrl.searchParams.entries()),
    };
    parentUrl.searchParams.delete('cohortRedirect');
    history.replaceState({}, '', parentUrl.toString());
  } else if (pathname) {
    cohortEmbedUrl.pathname = pathname;
  }

  for (const [key, value] of Object.entries(iframeParams)) {
    if (value !== undefined) {
      cohortEmbedUrl.searchParams.set(key, String(value));
    }
  }
  return cohortEmbedUrl;
}
