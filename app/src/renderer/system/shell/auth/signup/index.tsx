import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Icons, Card, Flex, Box, IconButton } from '../../../../components';
import { AddShip } from './add-ship';
import { ConnectingShip } from './connecting';
import { useAuth } from '../../../../logic/store';
import ProfileSetup from './step-profile';
import StepPassword from './step-password';
import StepInstall from './step-install';

type LoginProps = {
  isFullscreen?: boolean;
  goToLogin: () => void;
};

export const Signup: FC<LoginProps> = observer((props: LoginProps) => {
  const { goToLogin } = props;
  const { authStore, signupStore } = useAuth();
  const [step, setStep] = useState(
    signupStore.steps.indexOf(signupStore.currentStep)
  );

  const goBack = () => {
    if (step === 0) {
      goToLogin();
    } else if (step === 2) {
      goToLogin();
    } else {
      setStep(step - 1);
    }
  };

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
      <motion.div
        key="signup-card"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
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
            <AddShip hasShips={authStore.hasShips} next={() => next()} />
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
              <IconButton onClick={() => goBack()}>
                <Icons name="ArrowLeftLine" />
              </IconButton>
            </Flex>
          </Box>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
});

export default Signup;
