import styled from 'styled-components';

import { Button, Flex, Icon, Text } from '@holium/design-system/general';

import { useShareModal } from './useShareModal';

const ShareModalHeaderContainer = styled(Flex)`
  padding: 8px 8px 16px 8px;
  justify-content: space-between;
  align-items: center;
`;

const ShareButton = styled(Button.IconButton)`
  height: 30px;
  width: 30px;
  &:hover:not([disabled]) {
    background: rgba(var(--rlm-accent-rgba), 0.12);
  }
`;

export const ShareModalHeader = () => {
  const { object, colors, paths } = useShareModal();

  if (!object) return <div />;

  return (
    <ShareModalHeaderContainer>
      <Flex gap={8}>
        <Icon
          name={object.icon}
          size={44}
          fill="text"
          opacity={1}
          style={{
            padding: '4px',
            borderRadius: '6px',
            border: '2px solid var(--rlm-border-color)',
            background: '#FFFfff',
          }}
        />
        <Flex col={true}>
          <Text.H2
            color={colors.textColor}
            fontSize={16}
            lineHeight={21}
            fontWeight={500}
          >
            {object.app}
          </Text.H2>
          <Text.Label
            opacity={0.7}
            fontSize={13}
            lineHeight={18}
            fontWeight={300}
          >
            Share {object.dataTypeName}
          </Text.Label>
        </Flex>
      </Flex>
      <ShareButton
        disabled={paths.find((p) => p.selected) ? undefined : true}
        height="30px"
        width="30px"
        background="rgba(var(--rlm-accent-rgba), 0.12)"
        onClick={() =>
          object.share(
            object,
            paths.filter((p) => p.selected)
          )
        }
      >
        <Icon
          name="ShareArrow"
          size={30}
          mt={1}
          ml={2}
          style={{ fill: '#4E9EFD' }}
        />
      </ShareButton>
    </ShareModalHeaderContainer>
  );
};
