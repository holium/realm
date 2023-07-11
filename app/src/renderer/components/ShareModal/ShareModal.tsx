import { useMemo } from 'react';
import styled from 'styled-components';

import { Card, Flex, Portal, Text } from '@holium/design-system/general';

import { ShareModalBubble } from './ShareModalBubble';
import { ShareModalHeader } from './ShareModalHeader';
import { ShareModalPathRows } from './ShareModalPathRows';
import { ShareObject, useShareModal } from './useShareModal';

const WIDTH = 340;
const HEIGHT = 470;

const ShareTo = styled(Flex)`
  margin: 8px;
`;

const ShareToHr = styled.hr`
  border: none;
  flex-grow: 2;
  height: 1px;
  margin-top: 8px;
  margin-left: 8px;
  background-color: #3333331a;
`;

const ShareToLabel = styled(Text.Label)`
  color: rgba(var(--rlm-text-rgba), 0.4);
  text-align: center;
  font-size: 14px;
  font-family: Rubik;
  font-weight: 500;
`;

type Props = {
  object: ShareObject;
};

const ShareModalView = ({ object }: Props) =>
  useMemo(
    () => (
      <Portal>
        <Card
          id="share-modal"
          p={1}
          elevation={2}
          position="absolute"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            transition: {
              duration: 0.1,
            },
          }}
          exit={{
            opacity: 0,
            y: 8,
            transition: {
              duration: 0.1,
            },
          }}
          style={{
            y: (window.innerHeight - HEIGHT) / 2,
            x: (window.innerWidth - WIDTH) / 2,
            width: WIDTH,
            maxHeight: HEIGHT,
            backgroundColor: 'rgba(var(--rlm-window-bg-rgba))',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Flex flex={1} flexDirection="column" minHeight={0}>
            <ShareModalHeader />
            <ShareModalBubble />
            <ShareTo>
              <ShareToLabel>Share to</ShareToLabel>
              <ShareToHr />
            </ShareTo>
            <ShareModalPathRows />
          </Flex>
        </Card>
      </Portal>
    ),
    [object]
  );

export const ShareModal = () => {
  const { object } = useShareModal();

  if (!object) return null;

  return <ShareModalView object={object} />;
};
