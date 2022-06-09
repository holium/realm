import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Icons,
  Card,
  Flex,
  Box,
  IconButton,
  Text,
  TextButton,
} from 'renderer/components';
import { AddShip, ContinueButton } from './add-ship';
import { ConnectingShip } from './connecting';
import { useAuth, useMst } from 'renderer/logic/store';
import ProfileSetup from './step-profile';
import StepPassword from './step-password';
import StepInstall from './step-install';
import HoliumAnimated, {
  SplashWordMark,
} from 'renderer/components/Icons/holium';
import { useCallback } from 'react';

type LoginProps = {
  isFullscreen?: boolean;
  firstTime: boolean;
  goToLogin: () => void;
};

export const Signup: FC<LoginProps> = observer((props: LoginProps) => {
  const { firstTime, goToLogin } = props;
  const { themeStore } = useMst();
  const { authStore, signupStore } = useAuth();
  const [step, setStep] = useState(
    signupStore.steps.indexOf(signupStore.currentStep)
  );
  const inProgressShips = authStore.inProgressList;

  const goBack = () => {
    if (step === 0) {
      goToLogin();
    } else if (step === 2) {
      goToLogin();
    } else {
      setStep(step - 1);
    }
  };

  const continueSignup = useCallback(
    (id: string) => {
      setStep(1);
      signupStore.setSignupShip(authStore.ships.get(id));
    },
    [authStore.setSession, setStep]
  );

  const next = () => {
    if (step !== signupStore.steps.length - 1) setStep(step + 1);
  };

  const cardSizes = {
    '0': {
      width: 560,
      height: 300,
    },
    '1': {
      width: 560,
      height: 300,
    },
    '2': {
      width: 560,
      height: 360,
    },
    '3': {
      width: 560,
      height: 360,
    },
    '4': {
      width: 560,
      height: 360,
    },
  };

  // @ts-expect-error why
  const { width, height } = cardSizes[step.toString()!];

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
          initial={{ scale: 0.9, opacity: firstTime ? 1 : 0 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.4, opacity: { delay: firstTime ? 5 : 0 } }}
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
      <motion.div
        key="signup-card"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2, delay: firstTime ? 5 : 0 }}
        exit={{ scale: 0 }}
      >
        <Card
          pt={24}
          pl={12}
          pr={24}
          pb={50}
          width={width}
          height={height}
          position="relative"
        >
          {step === 0 && (
            // eslint-disable-next-line jsx-a11y/no-access-key
            <AddShip
              firstTime={firstTime}
              hasShips={authStore.hasShips}
              next={() => next()}
            />
          )}
          {step === 1 && <ConnectingShip next={() => next()} />}
          {step === 2 && <ProfileSetup next={() => next()} />}
          {step === 3 && <StepPassword next={() => next()} />}
          {step === 4 && <StepInstall next={() => goToLogin()} />}

          <Box position="absolute" height={40} bottom={20} left={20}>
            <Flex
              mt={5}
              width="100%"
              alignItems="center"
              justifyContent="flex-start"
            >
              {!firstTime && (
                <IconButton onClick={() => goBack()}>
                  <Icons name="ArrowLeftLine" />
                </IconButton>
              )}
            </Flex>
          </Box>
        </Card>
      </motion.div>
      {/* {step === 0 && (
        <Flex
          mt={4}
          top={`calc(50% + ${height / 2}px)`}
          key="continue-section"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: firstTime ? 5 : 0 }}
          position="absolute"
          gap={12}
        >
          {inProgressShips.map((ship: any) => (
            <ContinueButton
              onClick={() => continueSignup(ship.id)}
              key={`continue-${ship.patp}`}
              ship={ship}
              theme={themeStore.theme}
            />
          ))}
        </Flex>
      )} */}
    </AnimatePresence>
  );
});

export default Signup;
