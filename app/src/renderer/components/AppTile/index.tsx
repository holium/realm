import { FC, useRef, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { lighten, rgba, darken } from 'polished';
import { Flex, Box, Text, ContextMenu } from '..';
import { AppType } from 'os/services/spaces/models/bazaar';
import { toJS } from 'mobx';
import { bgIsLightOrDark } from 'os/lib/color';
import Icons from '../Icons';
import { Portal } from 'renderer/system/dialog/Portal';
import { AnimatePresence } from 'framer-motion';
import { ThemeType } from 'renderer/theme';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';

const sizes = {
  sm: 32,
  md: 48,
  lg: 120,
  xl: 148,
  xl1: 160,
  xl2: 196,
  xxl: 210,
};

const radius = {
  sm: 4,
  md: 12,
  lg: 16,
  xl: 20,
  xl1: 20,
  xl2: 24,
  xxl: 20,
};

const scales = {
  sm: 0.07,
  md: 0.05,
  lg: 0.07,
  xl: 0.05,
  xl1: 0.03,
  xl2: 0.03,
  xxl: 0.02,
};

interface TileHighlightProps {
  isSelected?: boolean;
  isOpen?: boolean;
  theme: ThemeType;
}
export const TileHighlight = styled(Box)<TileHighlightProps>`
  left: 11px;
  bottom: -8px;
  width: 10px;
  height: 5px;
  border-radius: 4px;
  position: absolute;
  ${(props: TileHighlightProps) =>
    props.isOpen &&
    css`
      background-color: ${lighten(0.05, props.theme.colors.icon.app)};
    `}
  ${(props: TileHighlightProps) =>
    props.isSelected &&
    css`
      background-color: ${lighten(0.05, props.theme.colors.brand.primary)};
    `}
`;

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

export type AppTileSize = 'sm' | 'md' | 'lg' | 'xl' | 'xl1' | 'xl2' | 'xxl';
interface AppTileProps {
  isPinned?: boolean;
  contextPosition?: 'above' | 'below';
  allowContextMenu?: boolean;
  contextMenu?: any[] | (() => any[]); // todo types
  onAppClick?: (app: AppType) => void;
  selected?: boolean;
  open?: boolean;
  app: AppType | any;
  variants?: any;
  isVisible?: boolean;
  isAnimated?: boolean;
  tileSize: AppTileSize;
  hasTitle?: boolean;
}

export const AppTile: FC<AppTileProps> = observer((props: AppTileProps) => {
  const {
    app,
    contextMenu,
    contextPosition,
    variants,
    selected,
    tileSize,
    allowContextMenu,
    isPinned,
    open,
    isAnimated,
    onAppClick,
    hasTitle,
  } = props;
  const { theme } = useServices();

  const tileRef = useRef(null);

  return useMemo(() => {
    let title;
    const isAppGrid =
      tileSize === 'xxl' || tileSize === 'xl2' || tileSize === 'xl1';
    const boxShadowStyle = isAppGrid
      ? '0px 2px 8px rgba(0, 0, 0, 0.15)'
      : 'none';
    const boxShadowHover = isAppGrid
      ? '0px 4px 8px rgba(0, 0, 0, 0.15)'
      : 'none';
    const lightOrDark: 'light' | 'dark' = bgIsLightOrDark(app.color);
    const isLight = lightOrDark === 'light';
    const textColor = isLight ? rgba('#333333', 0.8) : rgba('#FFFFFF', 0.8);
    if (isAppGrid) {
      // @ts-ignore
      const appColor = app.color;
      title = (
        <Text
          position="absolute"
          // style={{ mixBlendMode: 'hard-light' }}
          left={tileSize === 'xl1' ? '1.2rem' : '1.5rem'}
          padding=".2rem"
          borderRadius={4}
          backgroundColor={app.image && appColor}
          bottom={tileSize === 'xl1' ? '1rem' : '1.25rem'}
          fontWeight={500}
          fontSize={2}
          color={textColor}
        >
          {app.title}
        </Text>
      );
    }
    const tileId = `app-tile-grid-${app.id}`;

    // set image or icon
    let graphic;
    if (app.image) {
      graphic = (
        <TileStyle
          id={tileId}
          onContextMenu={(evt: any) => {
            evt.stopPropagation();
          }}
          {...(isAnimated
            ? {
                whileHover: {
                  scale: 1 + scales[tileSize] / 2,
                  boxShadow: boxShadowHover,
                },
                whileTap: {
                  scale: 1 - scales[tileSize],
                  boxShadow: boxShadowHover,
                },
              }
            : {})}
          animate={{
            boxShadow: boxShadowStyle,
          }}
          transition={{ scale: 0.5, boxShadow: { duration: 0.5 } }}
          minWidth={sizes[tileSize]}
          style={{
            borderRadius: radius[tileSize],
            overflow: 'hidden',
          }}
          height={sizes[tileSize]}
          width={sizes[tileSize]}
          backgroundColor={app.color || '#F2F3EF'}
        >
          <img
            style={{ pointerEvents: 'none' }}
            draggable="false"
            height={sizes[tileSize]}
            width={sizes[tileSize]}
            key={app.title}
            src={app.image}
          />
          {title}
        </TileStyle>
      );
    } else if (app.icon) {
      const iconTileSize = sizes[tileSize];
      const iconSize =
        iconTileSize < 88 ? sizes[tileSize] / 1.6 : sizes[tileSize] / 2.5;

      graphic = (
        <TileStyle
          id={tileId}
          onContextMenu={(evt: any) => {
            evt.stopPropagation();
          }}
          {...(isAnimated
            ? {
                whileHover: {
                  scale: 1 + scales[tileSize] / 2,
                  boxShadow: boxShadowHover,
                },
                whileTap: {
                  scale: 1 - scales[tileSize],
                  boxShadow: boxShadowHover,
                },
              }
            : {})}
          animate={{
            boxShadow: boxShadowStyle,
          }}
          transition={{ scale: 0.5, boxShadow: { duration: 0.5 } }}
          minWidth={sizes[tileSize]}
          style={{ borderRadius: radius[tileSize], overflow: 'hidden' }}
          height={sizes[tileSize]}
          width={sizes[tileSize]}
          backgroundColor={app.color || '#F2F3EF'}
        >
          <Icons name={app.icon} height={iconSize} width={iconSize} />
          {title}
        </TileStyle>
      );
    } else {
      graphic = (
        <TileStyle
          id={tileId}
          onContextMenu={(evt: any) => {
            evt.stopPropagation();
          }}
          {...(isAnimated
            ? {
                whileHover: {
                  scale: 1 + scales[tileSize] / 2,
                  boxShadow: boxShadowHover,
                },
                whileTap: {
                  scale: 1 - scales[tileSize],
                  boxShadow: boxShadowHover,
                },
              }
            : {})}
          animate={{
            boxShadow: boxShadowStyle,
          }}
          transition={{
            scale: { duration: 0.5 },
            boxShadow: { duration: 0.5 },
          }}
          minWidth={sizes[tileSize]}
          style={{ borderRadius: radius[tileSize], overflow: 'hidden' }}
          key={app.title}
          backgroundColor={app.color}
          height={sizes[tileSize]}
          width={sizes[tileSize]}
        >
          {title}
        </TileStyle>
      );
    }
    return (
      <Flex flexDirection="column" alignItems="center">
        <Flex
          position="relative"
          ref={tileRef}
          variants={variants}
          onClick={(evt: any) => {
            evt.stopPropagation();
            onAppClick && onAppClick(app);
          }}
          className="app-dock-icon"
        >
          {allowContextMenu && (
            <Portal>
              <AnimatePresence>
                <ContextMenu
                  position={contextPosition!}
                  isComponentContext
                  textColor={textColor}
                  customBg={app.color}
                  containerId={tileId}
                  parentRef={tileRef}
                  style={{ minWidth: 180 }}
                  menu={contextMenu || []}
                />
              </AnimatePresence>
            </Portal>
          )}
          {graphic}
          <TileHighlight
            layoutId="active-app"
            isSelected={selected}
            isOpen={open}
            transition={{ duration: 0.2 }}
          />
        </Flex>
        {hasTitle && (
          <Text color={theme.currentTheme.textColor} mt={2}>
            {app.title}
          </Text>
        )}
      </Flex>
    );
  }, [app, isPinned, selected, open]);
});

AppTile.defaultProps = {
  tileSize: 'md',
  allowContextMenu: false,
  isAnimated: true,
};
