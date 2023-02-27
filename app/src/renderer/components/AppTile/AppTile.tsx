import { useEffect, useMemo, useRef } from 'react';
import { observer } from 'mobx-react';
import styled, { css } from 'styled-components';
import { darken, desaturate } from 'polished';
import { Text } from 'renderer/components';
import { Box, Flex, Spinner } from '@holium/design-system';
import { AppType, InstallStatus } from 'os/services/spaces/models/bazaar';
import { lighten, rgba } from 'polished';
import { bgIsLightOrDark } from 'os/lib/color';
import { Icons } from '../Icons';
import { ThemeType } from 'renderer/theme';
import { useServices } from 'renderer/logic/store';
import { getAppTileFlags } from 'renderer/logic/lib/app';
import {
  ContextMenuOption,
  useContextMenu,
} from 'renderer/components/ContextMenu';
import { Variants } from 'framer-motion';

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
  isActive?: boolean;
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
    props.isActive &&
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
  app: AppType;
  tileId: string;
  contextMenuOptions?: ContextMenuOption[];
  variants?: Variants;
  tileSize: AppTileSize;
  installStatus?: InstallStatus;
  isOpen?: boolean;
  hasTitle?: boolean;
  isActive?: boolean;
  isAnimated?: boolean;
  highlightOnHover?: boolean;
  onAppClick?: (app: AppType) => void;
}

const AppTilePresenter = ({
  app,
  tileId,
  contextMenuOptions,
  variants,
  tileSize = 'md',
  isOpen = false,
  isActive = false,
  isAnimated = true,
  hasTitle,
  installStatus = InstallStatus.installed,
  onAppClick,
}: AppTileProps) => {
  const { theme } = useServices();
  const { getOptions, setOptions, getColors, setColors } = useContextMenu();
  const tileRef = useRef(null);
  const isAppGrid =
    tileSize === 'xxl' || tileSize === 'xl2' || tileSize === 'xl1';
  const boxShadowStyle = isAppGrid ? '0px 2px 8px rgba(0, 0, 0, 0.15)' : 'none';
  const boxShadowHover = isAppGrid ? '0px 4px 8px rgba(0, 0, 0, 0.15)' : 'none';

  const isLight = useMemo(() => {
    return bgIsLightOrDark(app.color) === 'light';
  }, [app.color]);

  const textColor = useMemo(
    () => (isLight ? rgba('#333333', 0.8) : rgba('#FFFFFF', 0.8)),
    [isLight]
  );
  const contextMenuColors = useMemo(
    () => ({ textColor, backgroundColor: app.color }),
    [app.color, textColor]
  );

  useEffect(() => {
    if (contextMenuOptions && contextMenuOptions !== getOptions(tileId)) {
      setOptions(tileId, contextMenuOptions);
    }

    if (contextMenuColors && contextMenuColors !== getColors(tileId)) {
      setColors(tileId, contextMenuColors);
    }
  }, [
    contextMenuColors,
    contextMenuOptions,
    getColors,
    getOptions,
    setColors,
    setOptions,
    tileId,
  ]);

  const {
    isInstalling,
    isFaded,
    isSuspended,
    isUninstalled,
    isFailed,
    isDesktop,
  } = getAppTileFlags(installStatus || InstallStatus.installed);

  let title;
  let status;
  if (isAppGrid) {
    const appColor = app.color;
    title = (
      <Text
        position="absolute"
        style={{ pointerEvents: 'none' }}
        left={tileSize === 'xl1' ? '1.2rem' : '1.5rem'}
        padding=".2rem"
        borderRadius={4}
        // @ts-ignore
        backgroundColor={app.image && appColor}
        bottom={tileSize === 'xl1' ? '1rem' : '1.25rem'}
        fontWeight={500}
        fontSize={2}
        color={textColor}
      >
        {app.title}
      </Text>
    );
    if (isSuspended || isFailed) {
      let statusBadgeColor = isLight
        ? darken(0.05, desaturate(1, app.color))
        : lighten(0.1, desaturate(1, app.color));
      if (isFailed) {
        statusBadgeColor = isLight
          ? rgba(darken(0.05, '#D0384E'), 0.1)
          : rgba(lighten(0.1, '#D0384E'), 0.1);
      }
      status = (
        <Text
          position="absolute"
          style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
          left={tileSize === 'xl1' ? '1.2rem' : '1.5rem'}
          padding={tileSize === 'xl1' ? '.1rem .2rem' : '.3rem .4rem'}
          borderRadius={6}
          backgroundColor={rgba(statusBadgeColor, 0.5)}
          top={tileSize === 'xl1' ? '1rem' : '1.25rem'}
          fontWeight={500}
          textStyle="capitalize"
          fontSize={tileSize === 'xl1' ? '13px' : 2}
          color={isFailed ? '#5e0b18' : textColor}
        >
          {app.installStatus}
        </Text>
      );
    }
  }

  const tileBg = app.color || '#F2F3EF';
  const filter =
    isSuspended || isFailed
      ? { filter: 'grayscale(1)' }
      : { filter: 'grayscale(0)' };

  // set image or icon
  let graphic;
  // @ts-ignore
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
        initial={{
          opacity: isFaded ? 0.5 : 1,
          ...filter,
        }}
        animate={{
          opacity: isFaded ? 0.5 : 1,
          boxShadow: boxShadowStyle,
          ...filter,
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
        background={tileBg}
      >
        <img
          alt={app.title}
          style={{ pointerEvents: 'none' }}
          draggable="false"
          height={sizes[tileSize]}
          width={sizes[tileSize]}
          key={`app-image-${tileId}`}
          // @ts-ignore
          src={app.image}
        />
        {title}
      </TileStyle>
    );
    // @ts-ignore
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
        background={tileBg}
      >
        {/* @ts-ignore */}
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
        initial={{
          opacity: isFaded ? 0.5 : 1,
          ...filter,
        }}
        animate={{
          opacity: isFaded ? 0.5 : 1,
          boxShadow: boxShadowStyle,
          ...filter,
        }}
        transition={{
          scale: { duration: 0.1 },
          boxShadow: { duration: 0.1 },
        }}
        minWidth={sizes[tileSize]}
        style={{ borderRadius: radius[tileSize], overflow: 'hidden' }}
        key={tileId}
        background={tileBg}
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
        onClick={(e) => {
          e.stopPropagation();
          onAppClick &&
            !isSuspended &&
            !isFailed &&
            !isUninstalled &&
            !isInstalling &&
            !isDesktop &&
            onAppClick(app);
        }}
        className="app-dock-icon"
      >
        {status}
        {isInstalling && !isUninstalled && (
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
            <Spinner size={loaderSizes[tileSize]} color="#FFF" />
          </Flex>
        )}
        {graphic}
        <TileHighlight
          layoutId={`tile-highlight-${tileId}`}
          isActive={isActive}
          isOpen={isOpen}
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
    </Flex>
  );
};

export const AppTile = observer(AppTilePresenter);
