import { useEffect } from 'react';
import { Fill } from 'react-spaces';
import { AnimatePresence, motion } from 'framer-motion';
import { observer } from 'mobx-react';

import { Flex } from '@holium/design-system';

import { useSound } from 'renderer/lib/sound';
import { useAppState } from 'renderer/stores/app.store';

const SplashPresenter = () => {
  const { setSeenSplash } = useAppState();
  const sound = useSound();
  useEffect(() => {
    sound.playStartup();
    setTimeout(() => {
      setSeenSplash();
    }, 7000);
  }, []);

  return (
    <Fill>
      <Flex height="100vh" alignItems="center" justifyContent="center">
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
              }}
              exit={{ opacity: 0 }}
            >
              <AnimatedHoliumLogo />
              <SplashWordMark
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, opacity: { delay: 2.2 } }}
              />
            </motion.div>
          </Flex>
        </AnimatePresence>
      </Flex>
    </Fill>
  );
};

export const Splash = observer(SplashPresenter);

const path1 =
  'M37.7723 9.09912C44.0696 9.5115 50.2497 12.1242 55.0628 16.9372C59.8758 21.7503 62.4885 27.9304 62.9009 34.2276H45.1815C41.0896 34.2276 37.7723 30.9104 37.7723 26.8184V9.09912Z';
const path2 =
  'M62.8899 37.9322C62.4441 44.1742 59.8351 50.2906 55.0628 55.0629C50.2497 59.8759 44.0696 62.4886 37.7723 62.901V45.3414C37.7723 41.2495 41.0896 37.9322 45.1815 37.9322H62.8899Z';
const path3 =
  'M34.0677 62.89C27.8258 62.4442 21.7094 59.8352 16.9371 55.0629C12.1648 50.2906 9.55576 44.1742 9.10995 37.9322H26.6585C30.7505 37.9322 34.0677 41.2495 34.0677 45.3414V62.89Z';
const path4 =
  'M9.09902 34.2276C9.5114 27.9304 12.1241 21.7503 16.9371 16.9372C21.7094 12.1649 27.8258 9.55587 34.0677 9.11006V26.8184C34.0677 30.9104 30.7505 34.2276 26.6585 34.2276H9.09902Z';

const initialPosition1 = { x: 5, y: -5 };
const initialPosition2 = { x: 5, y: 5 };
const initialPosition3 = { x: -5, y: 5 };
const initialPosition4 = { x: -5, y: -5 };

const AnimatePath = ({ path, initialPosition, fill }: any) => {
  const animation = {
    initial: { opacity: 0, x: initialPosition.x, y: initialPosition.y },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: {
      x: { duration: 2, ease: 'easeOut' },
      y: { duration: 2, ease: 'easeOut' },
      opacity: {
        delay: 0.5,
        duration: 1.5,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.path
      d={path}
      fill={fill || '#ffffff'}
      fillOpacity="1"
      {...animation}
    />
  );
};

const AnimatedHoliumLogo = () => {
  return (
    <svg width="110" height="110" viewBox="0 0 70 70">
      <AnimatePath path={path1} initialPosition={initialPosition1} />
      <AnimatePath path={path2} initialPosition={initialPosition2} />
      <AnimatePath path={path3} initialPosition={initialPosition3} />
      <AnimatePath path={path4} initialPosition={initialPosition4} />
    </svg>
  );
};

export const SplashWordMark = (animateProps: any) => {
  return (
    <motion.svg
      width="110"
      height="18"
      viewBox="0 0 110 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...animateProps}
    >
      <motion.path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M59.9336 0V17.4706H56.6094V0H59.9336ZM73.4582 17.4706C75.4052 17.4706 76.8699 17.0047 77.8523 16.0729C78.8347 15.1412 79.3259 13.7522 79.3259 11.9059V0H76.2179V11.6729C76.2179 12.5529 75.9768 13.2302 75.4945 13.7047C75.0122 14.1792 74.262 14.4165 73.2439 14.4165H70.0287C68.9749 14.4165 68.2112 14.1792 67.7379 13.7047C67.2646 13.2302 67.0279 12.5529 67.0279 11.6729V0H63.8127V11.9059C63.8127 15.6157 65.7597 17.4706 69.6536 17.4706H73.4582ZM95.8678 18C97.0965 18 98.036 17.7124 98.6865 17.1373C99.337 16.5622 99.8429 15.7768 100.204 14.7811L104.649 3.6824C104.739 3.45923 104.87 3.27897 105.042 3.14163C105.214 3.00429 105.417 2.93562 105.652 2.93562C105.923 2.93562 106.144 3.02575 106.316 3.20601C106.488 3.38627 106.573 3.6309 106.573 3.93991V17.691H109.799V3.78541C109.799 2.65236 109.46 1.7382 108.782 1.04292C108.105 0.34764 107.088 0 105.733 0C104.505 0 103.57 0.287554 102.928 0.862661C102.287 1.43777 101.785 2.22318 101.424 3.21888L96.979 14.3176C96.7984 14.7983 96.455 15.0386 95.9491 15.0386C95.6781 15.0386 95.4568 14.9485 95.2851 14.7682C95.1135 14.588 95.0276 14.3519 95.0276 14.0601V3.78541C95.0276 2.65236 94.6889 1.7382 94.0113 1.04292C93.3337 0.34764 92.3174 0 90.9622 0C89.7336 0 88.7985 0.287554 88.1571 0.862661C87.5156 1.43777 87.0142 2.22318 86.6529 3.21888L80.9884 17.691H84.4033L89.8781 3.6824C89.9684 3.45923 90.0949 3.27897 90.2575 3.14163C90.4202 3.00429 90.6279 2.93562 90.8809 2.93562C91.1519 2.93562 91.3778 3.02575 91.5585 3.20601C91.7392 3.38627 91.8295 3.6309 91.8295 3.93991V14.1888C91.8295 15.3391 92.1638 16.2618 92.8323 16.9571C93.5008 17.6524 94.5127 18 95.8678 18Z"
        fill="#E2E7EA"
      />
      <motion.path
        d="M52.9298 16.9077V14.0162H46.2368C45.5556 14.0162 44.9893 13.9427 44.538 13.7956C44.0867 13.6486 43.7248 13.4485 43.4523 13.1953C43.1798 12.9421 42.9882 12.6398 42.8775 12.2886C42.7668 11.9374 42.7114 11.5657 42.7114 11.1737V11.1737V0.367176H39.697V11.1982C39.697 12.0313 39.812 12.795 40.0419 13.4893C40.2718 14.1836 40.6422 14.784 41.1531 15.2904C41.6641 15.7968 42.324 16.193 43.133 16.4789C43.9419 16.7648 44.9169 16.9077 46.058 16.9077V16.9077H52.9298Z"
        fill="#E2E7EA"
      />
      <motion.path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M34.6554 14.8742C33.3275 16.2301 31.4116 16.9081 28.908 16.9081H26.5734C24.0697 16.9081 22.1539 16.2301 20.8259 14.8742C19.498 13.5183 18.834 11.4517 18.834 8.67454C18.834 5.88103 19.498 3.79814 20.8259 2.42589C22.1539 1.05364 24.0697 0.367512 26.5734 0.367512H28.908C31.4116 0.367512 33.3275 1.05364 34.6554 2.42589C35.9834 3.79814 36.6474 5.88103 36.6474 8.67454C36.6474 11.4517 35.9834 13.5183 34.6554 14.8742ZM26.5721 14.0171H28.9066C30.5475 14.0171 31.7444 13.5964 32.4972 12.7551C33.25 11.9138 33.6264 10.5456 33.6264 8.65057C33.6264 6.75555 33.2542 5.3833 32.5099 4.53381C31.7655 3.68432 30.5644 3.25958 28.9066 3.25958H26.5721C24.9142 3.25958 23.7089 3.68432 22.9561 4.53381C22.2033 5.3833 21.8269 6.76372 21.8269 8.67507C21.8269 10.5701 22.1991 11.9342 22.9434 12.7673C23.6877 13.6005 24.8973 14.0171 26.5721 14.0171Z"
        fill="#E2E7EA"
      />
      <motion.path
        d="M2.99251 16.9077V9.99745H11.7418V16.9077H14.7597V0.367176H11.7418V7.10591H2.99251V0.367176H0V16.9077H2.99251Z"
        fill="#E2E7EA"
      />
    </motion.svg>
  );
};
