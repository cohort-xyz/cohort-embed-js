import CohortSDK from '@cohort-xyz/cohort-embed-js';
import {useCallback, useEffect, useState} from 'react';

function ExperienceSpaceWithCohortLogin() {
  const [cohort, setCohort] = useState<CohortSDK | null>(null);

  useEffect(() => {
    const cohort = new CohortSDK(import.meta.env.COHORT_XPS_ORIGIN_URL, true);

    setCohort(cohort);
    return () => {
      cohort.destroy();
      setCohort(null);
    };
  }, []);

  const renderExperienceSpace = useCallback(
    (node: HTMLElement | null) => {
      if (node && cohort) {
        cohort.renderExperienceSpace({
          auth: {
            authMode: 'cohort',
          },
          iframeOptions: {
            container: node,
          },
          pathname: '/challenges/qr-code/steps/246bda95-1501-4f06-a16f-b4cf0de5fa2a/verify',
        });
      }
    },
    [cohort],
  );

  return <div id='iframe-container' ref={renderExperienceSpace} />;
}

export default ExperienceSpaceWithCohortLogin;
