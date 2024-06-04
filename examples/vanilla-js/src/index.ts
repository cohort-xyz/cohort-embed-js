import CohortSDK from '@cohort-xyz/cohort-embed-js';

const sdk = new CohortSDK(import.meta.env.COHORT_XPS_ORIGIN_URL, true);

const AUTH_TOKEN = import.meta.env.COHORT_AUTH_TOKEN;

sdk.renderExperienceSpace(
  import.meta.env.COHORT_USER_EMAIL,
  {
    containerId: 'container',
    // pathname: '/store/test-store',
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

sdk.on('location.updated', message => {
  console.log('Location updated', message);
});

sdk.on('order.created', message => {
  console.log('Order created', message);
});
