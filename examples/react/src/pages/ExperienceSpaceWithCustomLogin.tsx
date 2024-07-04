import CohortSDK from '@cohort-xyz/cohort-embed-js';
import {useCallback, useEffect, useState} from 'react';
import {useAppState} from '../hooks/appState';

const getAuthToken = (userEmail: string) =>
  new Promise<string>(resolve => {
    // WARNING: Do not do this in production, this is for demo purposes only
    // The API key should not be exposed in your frontend code
    // The call to the API should be done in your backend
    fetch(`${import.meta.env.COHORT_API_URL}/v1/users/auth-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.COHORT_API_KEY}`,
      },
      body: JSON.stringify({
        email: userEmail,
      }),
    })
      .then(response => response.json())
      .then(data => {
        resolve(data.authToken);
      });
  });

function ExperienceSpaceWithCustomLogin() {
  const userEmail = useAppState(state => state.userEmail);
  const [cohort, setCohort] = useState<CohortSDK | null>(null);

  useEffect(() => {
    const cohort = new CohortSDK(import.meta.env.COHORT_XPS_ORIGIN_URL, true);

    const unsubscribeLocation = cohort.on('location.updated', message => {
      console.log('Location updated', message);
    });

    const unsubscribeOrder = cohort.on('order.created', message => {
      console.log('Order created', message);
    });

    setCohort(cohort);
    return () => {
      unsubscribeLocation();
      unsubscribeOrder();
      cohort.destroy();
      setCohort(null);
    };
  }, []);

  const renderExperienceSpace = useCallback(
    (node: HTMLElement | null) => {
      if (node && cohort) {
        cohort.renderExperienceSpace({
          auth: {
            authMode: 'custom',
            userEmail: userEmail,
            getAuthToken: getAuthToken,
            customLoginUrl: `${window.location.origin}/login`,
            customLoginRedirectParameterName: 'redirectUri',
          },
          iframeOptions: {
            container: node,
          },
        });
      }
    },
    [cohort, userEmail],
  );

  return <div id='iframe-container' ref={renderExperienceSpace} />;
}

export default ExperienceSpaceWithCustomLogin;
