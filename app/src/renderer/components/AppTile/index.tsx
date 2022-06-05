import { FC, useRef, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { lighten, rgba } from 'polished';
import { Flex, Box, Text, ContextMenu } from '..';
import { AppModelType } from '../../../core/ship/stores/docket';
import { toJS } from 'mobx';
import { bgIsLightOrDark } from 'core/theme/lib';
import Icons from '../Icons';
import { useMst } from 'renderer/logic/store';
import { Portal } from 'renderer/system/modals/Portal';
import { AnimatePresence } from 'framer-motion';
import { ThemeType } from 'renderer/theme';

const sizes = {
  sm: 32,
  md: 48,
  lg: 88,
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
    props.isSelected &&
    css`
      background-color: ${lighten(0.05, props.theme.colors.brand.primary)};
    `}
  ${(props: TileHighlightProps) =>
    props.isOpen &&
    css`
      background-color: ${lighten(0.05, props.theme.colors.icon.app)};
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

interface AppTileProps {
  isPinned?: boolean;
  contextPosition?: 'above' | 'below';
  allowContextMenu?: boolean;
  contextMenu?: any[]; // todo types
  onAppClick?: (app: AppModelType) => void;
  selected?: boolean;
  open?: boolean;
  app: AppModelType | any;
  variants?: any;
  isVisible?: boolean;
  tileSize: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

export const AppTile: FC<AppTileProps> = (props: AppTileProps) => {
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
    onAppClick,
  } = props;
  // const { themeStore } = useMst();
  const tileRef = useRef(null);

  return useMemo(() => {
    let title;
    const isAppGrid = tileSize === 'xxl';
    const boxShadowStyle = isAppGrid
      ? '0px 0px 4px rgba(0, 0, 0, 0.06)'
      : 'none';
    const lightOrDark: 'light' | 'dark' = bgIsLightOrDark(app.color);
    const isLight = lightOrDark === 'light';
    const textColor = isLight ? rgba('#333333', 0.8) : rgba('#FFFFFF', 0.8);
    if (isAppGrid) {
      // @ts-ignore
      title = (
        <Text
          position="absolute"
          style={{ mixBlendMode: 'hard-light' }}
          left="1.7rem"
          bottom="1.7rem"
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
          whileHover={{
            scale: 1 + scales[tileSize] / 2,
            boxShadow: boxShadowStyle,
          }}
          whileTap={{
            scale: 1 - scales[tileSize],
            boxShadow: boxShadowStyle,
          }}
          transition={{ scale: 0.5 }}
          minWidth={sizes[tileSize]}
          style={{ borderRadius: radius[tileSize], overflow: 'hidden' }}
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
          whileHover={{
            scale: 1 + scales[tileSize] / 2,
            boxShadow: boxShadowStyle,
          }}
          whileTap={{
            scale: 1 - scales[tileSize],
            boxShadow: boxShadowStyle,
          }}
          transition={{ scale: 0.5 }}
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
          whileHover={{ scale: 1 + scales[tileSize] / 2 }}
          whileTap={{ scale: 1 - scales[tileSize] }}
          transition={{ scale: 0.5 }}
          minWidth={sizes[tileSize]}
          style={{ borderRadius: radius[tileSize] }}
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
      <Flex
        position="relative"
        ref={tileRef}
        variants={variants}
        onClick={(evt: any) => {
          // evt.stopPropagation();
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
    );
  }, [app, isPinned, selected, open]);
};

AppTile.defaultProps = {
  tileSize: 'md',
  allowContextMenu: false,
};
