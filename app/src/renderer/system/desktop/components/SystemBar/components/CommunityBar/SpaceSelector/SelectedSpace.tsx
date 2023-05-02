import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Avatar, BarButton, Flex, Text } from '@holium/design-system';

import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

type EmptyPictureProps = {
  color?: string;
};

const EmptyPicture = styled.div<EmptyPictureProps>`
  height: 32px;
  width: 32px;
  background: ${({ color }) => color ?? '#000'};
  border-radius: 4px;
`;

const SpaceButton = styled(BarButton)`
  padding: 0px 4px;
  padding-right: 16px;
  text-align: left;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  user-select: none;
  gap: 8px;
  /* cursor: pointer; */
  pointer-events: auto;
`;

interface SelectedSpaceProps {
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

const SelectedSpacePresenter = ({ onClick }: SelectedSpaceProps) => {
  const { loggedInAccount, theme } = useAppState();
  const { spacesStore } = useShipStore();
  const selectedSpace = spacesStore.selected;
  const { textColor } = theme;

  let innerContent: JSX.Element | null;

  if (!selectedSpace) return null;

  if (selectedSpace.type === 'our') {
    if (!loggedInAccount) return null;
    innerContent = (
      <Flex
        style={{ pointerEvents: 'none' }}
        gap={8}
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
      >
        <Avatar
          simple
          size={28}
          avatar={loggedInAccount.avatar}
          patp={loggedInAccount.serverId}
          sigilColor={[loggedInAccount.color || '#000000', 'white']}
        />

        <Flex
          style={{ pointerEvents: 'none' }}
          mt="2px"
          flexDirection="column"
          justifyContent="center"
          {...FadeInMotion}
        >
          <Text.Custom
            style={{ textTransform: 'capitalize', pointerEvents: 'none' }}
            lineHeight="14px"
            fontSize={1}
            opacity={0.5}
            initial={{ color: textColor }}
            animate={{ color: textColor }}
            transition={{ color: { duration: 0.2 } }}
          >
            You
          </Text.Custom>
          <Text.Custom
            style={{ pointerEvents: 'none' }}
            fontSize={2}
            fontWeight={500}
            initial={{ color: textColor }}
            animate={{ color: textColor }}
            transition={{ color: { duration: 0.2 } }}
          >
            {loggedInAccount.nickname || loggedInAccount.serverId}
          </Text.Custom>
        </Flex>
      </Flex>
    );
  } else {
    innerContent = (
      <Flex
        style={{ pointerEvents: 'none' }}
        gap={8}
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
      >
        {selectedSpace.picture ? (
          <img
            alt={selectedSpace.name}
            style={{ borderRadius: 4 }}
            height="28px"
            width="28px"
            src={selectedSpace.picture}
          />
        ) : (
          <EmptyPicture color={selectedSpace.color ?? '#000000'} />
        )}
        <Flex
          style={{ pointerEvents: 'none' }}
          mt="2px"
          flexDirection="column"
          justifyContent="center"
          {...FadeInMotion}
        >
          <Text.Custom
            style={{ textTransform: 'capitalize', pointerEvents: 'none' }}
            initial={{ color: textColor }}
            animate={{ color: textColor }}
            transition={{ color: { duration: 0.2 } }}
            lineHeight="14px"
            fontSize={1}
            opacity={0.5}
          >
            {selectedSpace.type}
          </Text.Custom>
          <Text.Custom
            style={{ pointerEvents: 'none' }}
            initial={{ color: textColor }}
            animate={{ color: textColor }}
            transition={{ color: { duration: 0.2 } }}
            fontSize={2}
            fontWeight={500}
          >
            {selectedSpace.name}
          </Text.Custom>
        </Flex>
      </Flex>
    );
  }

  return (
    <SpaceButton
      id="spaces-tray-icon"
      whileTap={{ scale: 0.975 }}
      transition={{ scale: 0.2 }}
      onClick={onClick}
    >
      {innerContent}
    </SpaceButton>
  );
};

export const SelectedSpace = observer(SelectedSpacePresenter);
