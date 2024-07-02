import CohortSDK from '@cohort-xyz/cohort-embed-js';
import {useCallback, useEffect, useState} from 'react';

type ExperienceSpaceProps = {
  userEmail: string | null;
};

function ExperienceSpace({userEmail}: ExperienceSpaceProps) {
  const [sdk, setSdk] = useState<CohortSDK | null>(null);

  useEffect(() => {
    const instance = new CohortSDK(import.meta.env.COHORT_XPS_ORIGIN_URL, true);

    const offLocation = instance.on('location.updated', message => {
      console.log('Location updated', message);
    });

    const offOrder = instance.on('order.created', message => {
      console.log('Order created', message);
    });

    setSdk(instance);
    return () => {
      offLocation();
      offOrder();
      instance.destroy();
      setSdk(null);
    };
  }, []);

  const getAuthToken = () => new Promise<string>(resolve => {
    // WARNING: Do not do this in production, this is for demo purposes only
    // The API key should not be exposed in your frontend code
    // The call to the API should be done in your backend
    fetch(import.meta.env.COHORT_API_URL + '/v1/users/auth-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.COHORT_API_KEY}`,
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


  const renderExperienceSpace = useCallback(
    (node: HTMLElement | null) => {
      if (node && sdk) {
        sdk.renderExperienceSpace(
          {
            container: node,
            // pathname: '/rewards',
            // spinnerStyle: {
            // 	backgroundColor: 'black',
            // 	color: 'white',
            // },
            // iframeStyle: {
            // 	width: '400px',
            // },
            // urlParams: {
            // 	navigationType: 'burger',
            // 	navbar: false,
            // },
          },
          userEmail === null ? undefined : {
            userEmail,
            getAuthToken,
          }
        );
      }
    },
    [sdk, userEmail],
  );

  return (
    <div
      style={{
        width: '100%',
        height: '90%',
      }}
      ref={renderExperienceSpace}
    />
  );
}

export default ExperienceSpace;
