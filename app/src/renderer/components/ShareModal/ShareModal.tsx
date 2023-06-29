import { Card, Portal, Text } from '@holium/design-system';

import { useShareModal } from './useShareModal';

const WIDTH = 340;
const HEIGHT = 470;

export const ShareModal = () => {
  const { object, colors } = useShareModal();

  if (!object) return <div />;

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
          backgroundColor: colors.windowColor,
        }}
      >
        <Text.H2 color={colors.textColor}>Share Modal crap here</Text.H2>
      </Card>
    </Portal>
  );
};
