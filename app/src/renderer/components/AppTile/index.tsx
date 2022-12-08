import { FC, useRef, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { lighten, rgba, darken, desaturate } from 'polished';
import { Flex, Box, Text, ContextMenu, Spinner } from '..';
import { AppType, InstallStatus } from 'os/services/spaces/models/bazaar';
import { bgIsLightOrDark } from 'os/lib/color';
import Icons from '../Icons';
import { Portal } from 'renderer/system/dialog/Portal';
import { AnimatePresence } from 'framer-motion';
import { ThemeType } from 'renderer/theme';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { getAppTileFlags } from 'renderer/logic/lib/app';

const sizes = {
  sm: 32,
  md: 48,
  lg: 120,
  xl: 148,
  xl1: 160,
  xl2: 196,
  xxl: 210,
};

const loaderSizes = {
  sm: 0,
  md: 0,
  lg: 1,
  xl: 2,
  xl1: 3,
  xl2: 3,
  xxl: 3,
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

interface TileStyleProps {
  highlightOnHover?: boolean;
}

const TileStyle = styled(Box)<TileStyleProps>`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  user-select: none;
  transition: var(--transition);
  ${(props: TileStyleProps) =>
    props.highlightOnHover &&
    css`
      &:hover {
        transition: var(--transition);
        filter: brightness(0.92);
      }
    `}

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
  installStatus?: InstallStatus;
  isUninstalled?: boolean;
  hasTitle?: boolean;
  highlightOnHover?: boolean;
  isRecommended?: boolean;
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
    isRecommended,
    installStatus,
    highlightOnHover,
  } = props;
  const { theme } = useServices();

  const tileRef = useRef(null);

  return useMemo(() => {
    const lightOrDark: 'light' | 'dark' = bgIsLightOrDark(app.color);
    let title;
    let status;
    const isAppGrid =
      tileSize === 'xxl' || tileSize === 'xl2' || tileSize === 'xl1';
    const boxShadowStyle = isAppGrid
      ? '0px 2px 8px rgba(0, 0, 0, 0.15)'
      : 'none';
    const boxShadowHover = isAppGrid
      ? '0px 4px 8px rgba(0, 0, 0, 0.15)'
      : 'none';
    const isLight = lightOrDark === 'light';
    const textColor = isLight ? rgba('#333333', 0.8) : rgba('#FFFFFF', 0.8);
    const statusBadgeColor = isLight
      ? darken(0.05, desaturate(1, app.color))
      : lighten(0.1, desaturate(1, app.color));

    const { isInstalling, isFaded, isSuspended, isUninstalled } =
      getAppTileFlags(installStatus || InstallStatus.installed);

    if (isAppGrid) {
      const appColor = app.color;
      title = (
        <Text
          position="absolute"
          style={{ pointerEvents: 'none' }}
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
    if (installStatus === InstallStatus.suspended) {
      status = (
        <Text
          position="absolute"
          style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
          left={tileSize === 'xl1' ? '1.2rem' : '1.5rem'}
          padding={tileSize === 'xl1' ? '.1rem .2rem' : '.3rem .4rem'}
          borderRadius={6}
          backgroundColor={app.image && rgba(statusBadgeColor, 0.5)}
          top={tileSize === 'xl1' ? '1rem' : '1.25rem'}
          fontWeight={500}
          textStyle="capitalize"
          fontSize={tileSize === 'xl1' ? '13px' : 2}
          color={textColor}
        >
          {app.installStatus}
        </Text>
      );
    }
    const tileId = `app-tile-grid-${app.id}`;

    const tileBg = app.color || '#F2F3EF';

    // set image or icon
    let graphic;
    if (app.image) {
      graphic = (
        <TileStyle
          id={tileId}
          highlightOnHover={highlightOnHover}
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
          initial={{
            ...(isSuspended && { filter: 'grayscale(1)' }),
          }}
          animate={{
            opacity: isFaded ? 0.5 : 1,
            boxShadow: boxShadowStyle,
            ...(isSuspended && { filter: 'grayscale(1)' }),
          }}
          transition={{
            scale: { duration: 0.1 },
            boxShadow: { duration: 0.1 },
          }}
          minWidth={sizes[tileSize]}
          style={{
            borderRadius: radius[tileSize],
            overflow: 'hidden',
          }}
          height={sizes[tileSize]}
          width={sizes[tileSize]}
          backgroundColor={tileBg}
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
          highlightOnHover={highlightOnHover}
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
            opacity: isFaded ? 0.5 : 1,
            boxShadow: boxShadowStyle,
          }}
          transition={{
            scale: { duration: 0.1 },
            boxShadow: { duration: 0.1 },
          }}
          minWidth={sizes[tileSize]}
          style={{ borderRadius: radius[tileSize], overflow: 'hidden' }}
          height={sizes[tileSize]}
          width={sizes[tileSize]}
          backgroundColor={tileBg}
        >
          <Icons name={app.icon} height={iconSize} width={iconSize} />
          {title}
        </TileStyle>
      );
    } else {
      graphic = (
        <TileStyle
          id={tileId}
          highlightOnHover={highlightOnHover}
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
            opacity: isFaded ? 0.5 : 1,
            boxShadow: boxShadowStyle,
          }}
          transition={{
            scale: { duration: 0.1 },
            boxShadow: { duration: 0.1 },
          }}
          minWidth={sizes[tileSize]}
          style={{ borderRadius: radius[tileSize], overflow: 'hidden' }}
          key={app.title}
          backgroundColor={tileBg}
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
          onClick={(evt: React.MouseEvent<HTMLDivElement>) => {
            evt.stopPropagation();
            onAppClick &&
              !isSuspended &&
              !isUninstalled &&
              !isInstalling &&
              onAppClick(app);
          }}
          className="app-dock-icon"
        >
          {status}
          {isInstalling && (
            <Flex
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              position="absolute"
              left={0}
              top={0}
              right={0}
              bottom={0}
            >
              <Spinner color="#FFF" size={loaderSizes[tileSize]} />
            </Flex>
          )}
          {allowContextMenu && (
            <Portal>
              <AnimatePresence>
                <ContextMenu
                  position={contextPosition}
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
          <Text
            style={{ pointerEvents: 'none' }}
            color={theme.currentTheme.textColor}
            mt={2}
          >
            {app.title}
          </Text>
        )}
        {/* {app.type === 'urbit' && app.installed && (
          <IconButton
            tabIndex={-1}
            mt={5}
            height={32}
            onClick={() => alert('hi')}
          >
            {app.glob ? (<Spinner size={0} />) : (<Icons name="DownloadCircle" />)}
          </IconButton>
        )} */}
      </Flex>
    );
  }, [app, isRecommended, isPinned, selected, open, theme.currentTheme]);
});

AppTile.defaultProps = {
  tileSize: 'md',
  allowContextMenu: false,
  isAnimated: true,
  isRecommended: false,
  installStatus: InstallStatus.installed,
};
