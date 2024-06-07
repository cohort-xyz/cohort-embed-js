import CohortSDK from '@cohort-xyz/cohort-embed-js';
import {useCallback, useEffect, useState} from 'react';

function App() {
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

  const renderExperienceSpace = useCallback(
    (node: HTMLElement | null) => {
      if (node && sdk) {
        const AUTH_TOKEN = import.meta.env.COHORT_AUTH_TOKEN;

        sdk.renderExperienceSpace(
          import.meta.env.COHORT_USER_EMAIL,
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
          async () => {
            // This is a mock function to simulate the call to get the authentication token
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(AUTH_TOKEN);
              }, 1000);
            });
          },
        );
      }
    },
    [sdk],
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
      ref={renderExperienceSpace}
    />
  );
}

export default App;
