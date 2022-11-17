import { useRef, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { rgba, darken } from 'polished';
import { useServices } from 'renderer/logic/store';
import { Flex, Text, Icons, Box } from 'renderer/components';
import { ThemeType } from '../../../../../theme';

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

interface RowProps {
  theme: ThemeType;
  selected?: boolean;
  customBg: string;
}

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
  descriptionWidth?: number;
  onClick?: (app: any) => void;
  actionRenderer?: any;
}

export const AppRow = ({
  caption,
  descriptionWidth,
  app,
  onClick,
  actionRenderer,
}: AppRowProps) => {
  const { theme } = useServices();
  const rowRef = useRef<any>(null);
  const currentTheme = useMemo(() => theme.currentTheme, [theme.currentTheme]);
  let image = app.image;
  if (app && app.href && app.href.site) {
    // for the case an image is served by the ship
    // we wont have it until install, so set to null
    image = null;
  }
  let title = app.title;
  if (app && app.href && !app.title) {
    title = app.id.split('/')[1];
  }

  return (
    <AppRowStyle
      id={`app-row-${app.id}`}
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
          {image && (
            <img
              style={{ pointerEvents: 'none' }}
              draggable="false"
              height={sizes.sm}
              width={sizes.sm}
              src={image}
            />
          )}
          {app.icon && <Icons name={app.icon} height={16} width={16} />}
        </TileStyle>
        <Flex flexDirection="column" flex={1}>
          <Text
            fontWeight={500}
            color={currentTheme.textColor}
            style={{
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Text>
          <Text
            mt="2px"
            style={{
              width: descriptionWidth || 'fit-content',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
            fontSize={2}
            color={rgba(currentTheme.textColor, 0.4)}
          >
            {app.info}
          </Text>
        </Flex>
        {actionRenderer && (
          <div style={{ whiteSpace: 'nowrap' }}>{actionRenderer(app)}</div>
        )}
      </Flex>
    </AppRowStyle>
  );
};
