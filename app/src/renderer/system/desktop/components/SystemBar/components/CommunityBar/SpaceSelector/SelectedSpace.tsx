import { FC } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import styled from 'styled-components';
import { Flex, Text, Sigil } from 'renderer/components';
import { TrayButton } from '../../TrayButton';
import { useServices } from 'renderer/logic/store';

const EmptyPicture = styled.div`
  height: 32px;
  width: 32px;
  background: ${(p: any) => p.color || '#000'};
  border-radius: 4px;
`;

interface SelectedSpaceProps {
  selectorRef: any;
  onClick?: any;
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
    const { selectorRef, onClick } = props;
    const { spaces, ship, shell } = useServices();
    const selectedSpace = spaces.selected!;
    const { dockColor, textColor } = shell.desktop.theme;
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
            avatar={ship!.avatar}
            patp={ship!.patp}
            color={[ship!.color || '#000000', 'white']}
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
            <EmptyPicture color={'#000000'} />
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
              initial={{ color: textColor }}
              animate={{ color: textColor }}
              transition={{ color: { duration: 0.5 } }}
              lineHeight="14px"
              fontSize={1}
              opacity={0.5}
            >
              {selectedSpace.type}
            </Text>
            <Text
              style={{ pointerEvents: 'none' }}
              initial={{ color: textColor }}
              animate={{ color: textColor }}
              transition={{ color: { duration: 0.5 } }}
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
        onClick={onClick}
      >
        {innerContent}
      </TrayButton>
    );
  }
);
