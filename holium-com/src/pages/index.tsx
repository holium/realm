import { useEffect, useState } from 'react';

import { Text } from '@holium/design-system/general';

import { AnimatedText } from '../components/AnimatedText';
import { Page } from '../components/Page';

const futureOfTexts = [
  'collaborative computing',
  'online communities',
  'Web 3',
  'P2P networks',
  'DAOs',
];

export default function CreateAccount() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [replay, setReplay] = useState(true);
  const [futureOfText, setFutureOfText] = useState('');

  useEffect(() => {
    setFutureOfText(futureOfTexts[msgIdx]);
    setReplay(true);
    const interval = setInterval(() => {
      setMsgIdx((idx) => (idx + 1) % futureOfTexts.length);
    }, 7000);
    const replayInterval = setInterval(() => {
      setReplay(false);
    }, 6000);
    return () => {
      clearInterval(interval);
      clearInterval(replayInterval);
    };
  }, [msgIdx]);

  return (
    <Page title="Holium">
      <Text.Custom
        className="realm-is-text"
        fontWeight={600}
        style={{
          lineHeight: '70px',
          // textShadow: theme.mode === 'light' ? undefined : '0px 4px 4px rgba(0, 0, 0, 0.15)',
        }}
      >
        Realm is the future of{' '}
        <Text.Custom
          initial="hidden"
          fontWeight={700}
          animate={replay ? 'visible' : 'hidden'}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.025,
              },
            },
            hidden: {
              transition: {
                staggerChildren: 0.025,
              },
            },
          }}
        >
          <AnimatedText text={futureOfText} />
        </Text.Custom>
      </Text.Custom>
    </Page>
  );
}
