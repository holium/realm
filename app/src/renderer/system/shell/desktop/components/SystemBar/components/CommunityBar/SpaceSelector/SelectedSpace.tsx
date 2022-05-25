import { FC } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Flex, Text, Sigil } from '../../../../../../../../components';
import { TrayButton } from '../../TrayButton';
import { useShip, useSpaces } from 'renderer/logic/store';

const EmptyPicture = styled.div`
  height: 32px;
  width: 32px;
  background: ${(p: any) => p.color || '#000'};
  border-radius: 4px;
`;

interface SelectedSpaceProps {
  selectorRef: any;
}
const FadeInMotion = {
  initial: { opacity: 0 },
  exit: { opacity: 0 },
  animate: {
    opacity: 1,
  },
  transition: { opacity: { duration: 1, ease: 'easeIn' } },
};

export const SelectedSpace: FC<SelectedSpaceProps> = observer(
  (props: SelectedSpaceProps) => {
    const { selectorRef } = props;
    const spaceStore = useSpaces();
    const { ship } = useShip();
    const selectedSpace = spaceStore.selected!;
    const { dockColor, textColor } = selectedSpace.theme;
    let innerContent: any;
    if (selectedSpace.type === 'our') {
      innerContent = (
        <Flex
          style={{ pointerEvents: 'none' }}
          gap={8}
          flexDirection="row"
          alignItems="center"
        >
          <Sigil
            simple
            size={28}
            avatar={selectedSpace!.picture}
            patp={selectedSpace!.name}
            color={[selectedSpace!.color || '#000000', 'white']}
          />

          <Flex
            style={{ pointerEvents: 'none' }}
            mt="2px"
            flexDirection="column"
            justifyContent="center"
            {...FadeInMotion}
          >
            <Text
              style={{ textTransform: 'capitalize', pointerEvents: 'none' }}
              color={textColor}
              lineHeight="14px"
              fontSize={1}
              opacity={0.5}
            >
              You
            </Text>
            <Text
              style={{ pointerEvents: 'none' }}
              color={textColor}
              fontSize={2}
              fontWeight={500}
            >
              {ship?.nickname || ship?.patp}
            </Text>
          </Flex>
        </Flex>
      );
    } else {
      innerContent = (
        <Flex
          style={{ pointerEvents: 'none' }}
          gap={8}
          flexDirection="row"
          alignItems="center"
        >
          {selectedSpace.picture ? (
            <img
              style={{ borderRadius: 6 }}
              height="28px"
              width="28px"
              src={selectedSpace.picture}
            />
          ) : (
            <EmptyPicture color={selectedSpace.color} />
          )}
          <Flex
            style={{ pointerEvents: 'none' }}
            mt="2px"
            flexDirection="column"
            justifyContent="center"
            {...FadeInMotion}
          >
            <Text
              style={{ textTransform: 'capitalize', pointerEvents: 'none' }}
              color={textColor}
              lineHeight="14px"
              fontSize={1}
              opacity={0.5}
            >
              {selectedSpace.type}
            </Text>
            <Text
              style={{ pointerEvents: 'none' }}
              color={textColor}
              fontSize={2}
              fontWeight={500}
            >
              {selectedSpace.name}
            </Text>
          </Flex>
        </Flex>
      );
    }
    return (
      <TrayButton
        id="spaces-tray-icon"
        ref={selectorRef}
        whileTap={{ scale: 0.975 }}
        transition={{ scale: 0.2 }}
        customBg={dockColor}
      >
        {innerContent}
      </TrayButton>
    );
  }
);
