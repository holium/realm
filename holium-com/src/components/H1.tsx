import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Text } from '@holium/design-system/general';

import { AnimatedText } from './AnimatedText';

const futureOfTexts = [
  'collaborative computing',
  'online communities',
  'Web 3',
  'P2P networks',
  'DAOs',
];

export const H1Text = styled(Text.H1)`
  font-size: 64px;
  line-height: 1.1em;
  width: 100%;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.15);

  span {
    display: inline-flex;
    // Allow the text to wrap.
    overflow-wrap: break-word;
  }

  @media screen and (max-width: 768px) {
    font-size: 48px;
  }

  @media screen and (max-width: 480px) {
    font-size: 32px;
  }

  @media screen and (max-width: 400px) {
    font-size: 28px;
  }
`;

export const H1 = ({ className = '' }: { className?: string }) => {
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
    <H1Text className={className}>
      Realm is the future of{' '}
      <AnimatedText text={futureOfText} replay={replay} />
    </H1Text>
  );
};
