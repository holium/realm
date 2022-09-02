import { useRef, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { rgba, darken, lighten } from 'polished';
import { useServices } from 'renderer/logic/store';
import { Flex, Text, Icons, Box, Button } from 'renderer/components';
import { ThemeType } from '../../../../theme';

const sizes = {
  sm: 32,
  md: 48,
  lg: 120,
  xl: 148,
  xxl: 210,
};

const radius = {
  sm: 4,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 20,
};

const scales = {
  sm: 0.07,
  md: 0.05,
  lg: 0.07,
  xl: 0.05,
  xxl: 0.02,
};

interface TileStyleProps {}
const TileStyle = styled(Box)<TileStyleProps>`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  user-select: none;
  img {
    --webkit-user-select: none;
    --khtml-user-select: none;
    --moz-user-select: none;
    --o-user-select: none;
    user-select: none;
  }
`;

type RowProps = {
  theme: ThemeType;
  selected?: boolean;
  customBg: string;
};

export const AppRowStyle = styled(motion.div)<RowProps>`
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

interface AppRowProps {
  caption: string;
  app: any;
  onClick: (app: any) => void;
  actionRenderer?: any;
}

export const AppRow = ({
  caption,
  app,
  onClick,
  actionRenderer,
}: AppRowProps) => {
  const { desktop } = useServices();
  const { theme } = desktop;
  const rowRef = useRef<any>(null);
  const currentTheme = useMemo(() => theme, [theme]);
  return app ? (
    <AppRowStyle
      id={`app-row-${app.id}`}
      ref={rowRef}
      className="realm-cursor-hover"
      customBg={currentTheme.windowColor}
      // onContextMenu={(evt: any) => evt.stopPropagation()}
    >
      <Flex
        flexDirection="row"
        alignItems="center"
        gap={8}
        style={{ width: '100%' }}
        onClick={(e) => onClick && onClick(app)}
      >
        <TileStyle
          onContextMenu={(evt: any) => {
            evt.stopPropagation();
          }}
          minWidth={sizes.sm}
          style={{
            borderRadius: radius.sm,
            overflow: 'hidden',
          }}
          height={sizes.sm}
          width={sizes.sm}
          backgroundColor={app.color || '#F2F3EF'}
        >
          {app.image && (
            <img
              style={{ pointerEvents: 'none' }}
              draggable="false"
              height={sizes.sm}
              width={sizes.sm}
              key={app.title}
              src={app.image}
            />
          )}
          {app.icon && <Icons name={app.icon} height={16} width={16} />}
        </TileStyle>
        <Flex flexDirection="column" flex={1}>
          <Text fontWeight={500}>{app.title}</Text>
          <Text
            width={404}
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
            color={'#888888'}
          >
            {app.info}
          </Text>
        </Flex>
        {actionRenderer && (
          <div style={{ whiteSpace: 'nowrap' }}>{actionRenderer()}</div>
        )}
      </Flex>
    </AppRowStyle>
  ) : (
    <Text>{caption} not installed</Text>
  );
};
