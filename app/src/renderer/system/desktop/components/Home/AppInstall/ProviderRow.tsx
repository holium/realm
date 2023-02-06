import { useRef, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { darken } from 'polished';
import { useServices } from 'renderer/logic/store';
import { Flex, Text, Sigil } from 'renderer/components';
import { ThemeType } from '../../../../../theme';
import { Avatar } from '@holium/design-system';

interface RowProps {
  theme: ThemeType;
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
  transition: ${(props: RowProps) => props.theme.transition};
  ${(props: RowProps) =>
    props.selected
      ? css`
          background-color: ${darken(0.03, props.customBg)};
        `
      : css`
          &:hover {
            transition: ${(props: RowProps) => props.theme.transition};
            background-color: ${props.customBg
              ? darken(0.025, props.customBg)
              : 'inherit'};
          }
        `}
`;

interface ProviderRowProps {
  caption?: string;
  id: string;
  ship: string;
  color: string;
  onClick: (ship: string) => void;
}

export const ProviderRow = ({
  caption,
  id,
  ship,
  color,
  onClick,
}: ProviderRowProps) => {
  const { theme } = useServices();
  const rowRef = useRef<any>(null);
  const currentTheme = useMemo(() => theme.currentTheme, [theme.currentTheme]);
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
          <Text fontWeight={500} color={currentTheme.textColor}>
            {ship}
          </Text>
        </Flex>
      </Flex>
    </ProviderRowStyle>
  );
};
