import CohortSDK from '@cohort-xyz/cohort-embed-js';

const sdk = new CohortSDK(import.meta.env.COHORT_XPS_ORIGIN_URL, true);

sdk.renderExperienceSpace({
  auth: {
    authMode: 'cohort',
  },
  iframeOptions: {
    containerId: 'container',
  },
});

sdk.on('location.updated', message => {
  console.log('Location updated', message);
});

sdk.on('order.created', message => {
  console.log('Order created', message);
});
