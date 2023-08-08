import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import {
  Button,
  CopyButton,
  Flex,
  Icon,
  Spinner,
} from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import {
  OnboardDialogDescription,
  OnboardDialogInputLabel,
  OnboardDialogSubTitle,
  OnboardDialogTitleBig,
} from '../../components/OnboardDialog.styles';
import { GrayBox } from '../GetRealm/GetRealmDialogBody.styles';

const bootTextCarousel = [
  'This should take around a minute',
  'Your node stores all data associated with your account',
  'The data is encrypted, so even we can’t see the contents',
];

const inTransition = {
  duration: 0.5,
  ease: 'easeOut',
};

const outTransition = {
  duration: 0.75,
  ease: 'easeIn',
};

const fadeInOut = {
  hidden: { opacity: 0, y: 20, transition: inTransition },
  visible: { opacity: 1, y: 0, transition: inTransition },
  exit: { opacity: 0, y: -20, transition: outTransition },
};

export type BootingNodeDialogFields = {
  booted: boolean;
};

type Props = {
  booting: boolean;
  credentials: {
    id: string;
    url: string;
    accessCode: string;
  };
};

export const BootingNodeDialogBody = ({ booting, credentials }: Props) => {
  const showCode = useToggle(false);

  const [bootText, setBootText] = useState(bootTextCarousel[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isAnimating) return;

    const interval = setInterval(() => {
      const index = bootTextCarousel.indexOf(bootText);
      const nextIndex = index + 1 === bootTextCarousel.length ? 0 : index + 1;
      setIsAnimating(true);
      setBootText(bootTextCarousel[nextIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, [bootText, isAnimating]);

  return (
    <Flex flexDirection="column" gap="16px">
      <OnboardDialogTitleBig pb="16px">Booting your node</OnboardDialogTitleBig>
      <Flex
        flexDirection="column"
        minHeight={400}
        alignItems="center"
        justifyContent="space-between"
        mb="32px"
      >
        <Flex />
        <Flex flexDirection="column" alignItems="center" gap="2px">
          <OnboardDialogInputLabel as="label" htmlFor="eth-address">
            Urbit ID
          </OnboardDialogInputLabel>
          <OnboardDialogDescription>{credentials.id}</OnboardDialogDescription>
          {booting ? (
            <Spinner
              size="80px"
              width={8}
              my={26}
              color="var(--rlm-accent-color)"
            />
          ) : (
            <Flex
              my={26}
              p="16px"
              borderRadius="50%"
              background="var(--rlm-accent-color)"
            >
              <Icon name="Check" fill="window" size="50px" />
            </Flex>
          )}
        </Flex>
        {booting ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={bootText}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeInOut}
              onAnimationComplete={() => setIsAnimating(false)}
            >
              <OnboardDialogDescription>{bootText}</OnboardDialogDescription>
            </motion.div>
          </AnimatePresence>
        ) : (
          <GrayBox flexDirection="column">
            <Flex gap={4} alignItems="center">
              <OnboardDialogSubTitle width="100px" fontWeight={600}>
                URL
              </OnboardDialogSubTitle>
              <OnboardDialogDescription>
                {credentials.url}
              </OnboardDialogDescription>
            </Flex>
            <Flex gap={4} alignItems="center">
              <OnboardDialogSubTitle width="100px" fontWeight={600}>
                Access Code
              </OnboardDialogSubTitle>
              <OnboardDialogDescription width="216px">
                {showCode.isOn
                  ? credentials.accessCode
                  : '• • • • • • • • • • • • • • • • • • • • •'}
              </OnboardDialogDescription>
              <Button.IconButton type="button" onClick={showCode.toggle}>
                <Icon name={showCode.isOn ? 'EyeOff' : 'EyeOn'} opacity={0.5} />
              </Button.IconButton>
            </Flex>
            <Flex mt={1} width="100%" justifyContent="flex-end">
              <CopyButton
                content={[
                  credentials.id,
                  credentials.url,
                  credentials.accessCode,
                ].join(' ')}
                label="Copy"
                size={16}
              />
            </Flex>
          </GrayBox>
        )}
      </Flex>
    </Flex>
  );
};
