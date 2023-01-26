import { observer } from 'mobx-react';
import styled from 'styled-components';
import { useServices } from 'renderer/logic/store';
import { Flex, Text, Avatar, BarButton } from '@holium/design-system';

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

export const SelectedSpace = observer(({ onClick }: SelectedSpaceProps) => {
  const { spaces, ship, theme } = useServices();
  const selectedSpace = spaces.selected;
  const { textColor } = theme.currentTheme;

  let innerContent: JSX.Element | null;

  if (!selectedSpace) return null;

  if (selectedSpace.type === 'our') {
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
          avatar={ship!.avatar}
          patp={ship!.patp}
          sigilColor={[ship!.color || '#000000', 'white']}
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
            {ship?.nickname || ship?.patp}
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
});
