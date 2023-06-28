import { useMemo } from 'react';

import { Card, Portal } from '@holium/design-system';

import { useShipStore } from 'renderer/stores/ship.store';

const WIDTH = 340;
const HEIGHT = 470;

export const ShareModal = () => {
  const { chatStore } = useShipStore();

  const somethingToShare = useMemo(() => {
    return !!chatStore.selectedChat?.forwardingMsg;
  }, [chatStore.selectedChat]);

  console.log('rendering sharemodal', chatStore, somethingToShare);
  if (!somethingToShare) return <div />;
  console.log('rendering sharemodal with content');

  return (
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
          overflowY: 'auto',
        }}
      >
        Share Modal crap here
      </Card>
    </Portal>
  );
};
