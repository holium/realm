import { FC, useMemo } from 'react';
import { motion } from 'framer-motion';
import { rgba, lighten } from 'polished';
import styled, { css } from 'styled-components';
import { Flex, Icons, Text } from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { ThemeType } from '../../theme';
import { useServices } from 'renderer/logic/store-2';

const EmptyGroup = styled.div`
  height: 32px;
  width: 32px;
  background: ${(p) => p.color || '#000'};
  border-radius: 4px;
`;

type RowProps = {
  theme: ThemeType;
  selected?: boolean;
  customBg: string;
};

export const SpaceRowStyle = styled(motion.div)<RowProps>`
  height: 48px;
  border-radius: 8px;
  padding: 0 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  transition: ${(props: RowProps) => props.theme.transition};
  ${(props: RowProps) =>
    props.selected
      ? css`
          background-color: ${lighten(0.05, props.customBg)};
        `
      : css`
          &:hover {
            transition: ${(props: RowProps) => props.theme.transition};
            background-color: ${props.customBg
              ? rgba(lighten(0.1, props.customBg), 0.4)
              : 'inherit'};
          }
        `}
`;

type SpaceRowProps = {
  selected: boolean;
  space: SpaceModelType;
  onSelect: (spaceKey: string) => void;
};

export const SpaceRow: FC<SpaceRowProps> = (props: SpaceRowProps) => {
  const { selected, space, onSelect } = props;
  const { shell } = useServices();
  const { theme } = shell;

  const currentTheme = useMemo(() => theme.theme, [theme.theme]);
  return (
    <SpaceRowStyle
      data-close-tray="true"
      selected={selected}
      className="realm-cursor-hover"
      customBg={currentTheme.dockColor}
      onClick={() => {
        onSelect(space.path);
      }}
    >
      <Flex style={{ pointerEvents: 'none' }} alignItems="center">
        {space.picture ? (
          <img
            style={{ borderRadius: 6 }}
            height="32px"
            width="32px"
            src={space.picture}
          />
        ) : (
          <EmptyGroup color={space.color! || '#000000'} />
        )}
        <Flex ml={2} flexDirection="column">
          <Text
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
            fontSize={3}
            fontWeight={500}
            variant="body"
          >
            {space.name}

            {/* TODO add notification */}
            {/* <Icons.ExpandMore ml="6px" /> */}
          </Text>
          <Flex flexDirection="row" gap={12}>
            {/* <Flex gap={4} flexDirection="row" alignItems="center">
              <Icons name="Members" size={16} opacity={0.6} />
              {space.members && (
                <Text
                  fontWeight={400}
                  mt="1px"
                  mr={1}
                  opacity={0.6}
                  fontSize={2}
                >
                  {space.members.count} members
                </Text>
              )}
            </Flex> */}
            {space.token && (
              <Flex gap={4} flexDirection="row" alignItems="center">
                <Icons name="Coins" size={16} opacity={0.6} />
                <Text
                  fontWeight={400}
                  mt="1px"
                  mr={1}
                  opacity={0.6}
                  fontSize={2}
                >
                  {space.token.symbol}
                </Text>
              </Flex>
            )}
            {/* <Text fontWeight={500} mt="1px" opacity={0.6} variant="hint">
                {space.hasAdmin && `(owner)`}
              </Text> */}
          </Flex>
        </Flex>
      </Flex>
    </SpaceRowStyle>
  );
};
