import { useEffect } from 'react';
import { observer } from 'mobx-react';

import { ShellActions } from 'renderer/logic/actions/shell';
import { Flex } from 'renderer/components';
import { OnboardingStep } from 'os/services/onboarding/onboarding.model';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HoliumAnimated,
  SplashWordMark,
} from 'renderer/components/Icons/holium';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { SoundActions } from 'renderer/logic/actions/sound';

const SplashPresenter = () => {
  useEffect(() => {
    SoundActions.playStartup();

    setTimeout(() => {
      ShellActions.openDialog(OnboardingStep.DISCLAIMER);
      OnboardingActions.setSeenSplash();
    }, 5000);
  }, []);

  return (
    <AnimatePresence>
      <Flex
        key="brand-splash"
        position="absolute"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <motion.div
          key="holium-intro"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.4,
            // opacity: { delay: 5 },
          }}
          exit={{ opacity: 0 }}
        >
          <HoliumAnimated width="100px" height="100px" fill={'#FFFFFF'} />
          <SplashWordMark
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, opacity: { delay: 2 } }}
          />
        </motion.div>
      </Flex>
    </AnimatePresence>
  );
};

export const Splash = observer(SplashPresenter);
