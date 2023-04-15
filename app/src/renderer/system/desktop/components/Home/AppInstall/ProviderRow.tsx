import { useRef, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { darken } from 'polished';
import { Avatar, Flex, Text } from '@holium/design-system';
import { useAppState } from 'renderer/stores/app.store';

interface RowProps {
  selected?: boolean;
  customBg: string;
}

export const ProviderRowStyle = styled(motion.div)<RowProps>`
  height: 48px;
  position: relative;
  border-radius: 8px;
  padding: 0 8px;
  display: flex;
  flex-direction: row;
  overflow: visible;
  align-items: center;
  transition: var(--transition);
  ${(props: RowProps) =>
    props.selected
      ? css`
          background-color: ${darken(0.03, props.customBg)};
        `
      : css`
          &:hover {
            transition: var(--transition);
            background-color: ${props.customBg
              ? darken(0.025, props.customBg)
              : 'inherit'};
          }
        `}
`;

interface ProviderRowProps {
  id: string;
  ship: string;
  color: string;
  onClick: (ship: string) => void;
}

export const ProviderRow = ({ id, ship, color, onClick }: ProviderRowProps) => {
  const { theme } = useAppState();
  const rowRef = useRef<any>(null);
  const currentTheme = useMemo(() => theme, [theme]);
  return (
    <ProviderRowStyle
      id={`provider-row-${id}`}
      ref={rowRef}
      className="realm-cursor-hover"
      customBg={currentTheme.windowColor}
    >
      <Flex
        flexDirection="row"
        alignItems="center"
        gap={8}
        flex={1}
        // style={{ width: '100%' }}
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick(ship);
        }}
      >
        <Avatar
          simple
          size={28}
          // avatar={item.avatar}
          patp={ship}
          sigilColor={[color || '#000000', 'white']}
        />
        <Flex flexDirection="column" flex={1}>
          <Text.Custom
            fontWeight={500}
            style={{ color: currentTheme.textColor }}
          >
            {ship}
          </Text.Custom>
        </Flex>
      </Flex>
    </ProviderRowStyle>
  );
};
