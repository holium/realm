import { FC, useRef, useState } from 'react';
import styled from 'styled-components';
import { lighten } from 'polished';
import { Flex, Box, Text, Menu, MenuItem, useMenu } from '..';
import { AppModelType } from '../../../core/ship/stores/docket';
import { useMst } from '../../logic/store';
import { toJS } from 'mobx';

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
  sm: 0.1,
  md: 0.1,
  lg: 0.07,
  xl: 0.05,
  xxl: 0.02,
};

export const TileHighlight = styled(Box)`
  left: 11px;
  bottom: -8px;
  width: 10px;
  height: 5px;
  border-radius: 4px;
  position: absolute;
  background-color: ${(props: any) =>
    lighten(0.05, props.theme.colors.brand.primary)};
`;

interface TileStyleProps {}
const TileStyle = styled(Box)<TileStyleProps>`
  position: relative;
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
  onAppClick: (app: AppModelType) => void;
  selected?: boolean;
  app: AppModelType;
  variants?: any;
  isVisible?: boolean;
  tileSize: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

export const AppTile: FC<AppTileProps> = (props: AppTileProps) => {
  const { app, variants, selected, tileSize, onAppClick, isVisible } = props;
  const { desktopStore } = useMst();
  const tileRef = useRef(null);

  // Setting up options menu
  const menuWidth = 180;
  const config = useMenu(tileRef, {
    orientation: 'bottom-left',
    padding: 6,
    menuWidth,
  });
  const { anchorPoint, show, setShow } = config;

  const shouldShowTitle = tileSize === 'xxl';
  // const { openNewWindow } = useContext(WinManagerContext);
  let title;
  if (shouldShowTitle) {
    title = (
      <Text
        position="absolute"
        opacity={0.9}
        style={{ mixBlendMode: 'hard-light' }}
        left="1.7rem"
        bottom="1.7rem"
        fontWeight={500}
        fontSize={2}
      >
        {app.title}
      </Text>
    );
  }

  return (
    <Flex
      ref={tileRef}
      variants={variants}
      // animate={isVisible ? 'show' : 'hidden'}
      onClick={() => onAppClick(app)}
      className="app-dock-icon"
      position="relative"
      onContextMenu={(evt: any) => {
        evt.stopPropagation();
        evt.preventDefault();
        setShow(true);
      }}
    >
      {app.image ? (
        <TileStyle
          whileHover={{
            scale: 1 + scales[tileSize] / 2,
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.06)',
          }}
          whileTap={{
            scale: 1 - scales[tileSize],
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.03)',
          }}
          transition={{ scale: 0.5 }}
          minWidth={sizes[tileSize]}
          style={{ borderRadius: radius[tileSize], overflow: 'hidden' }}
          height={sizes[tileSize]}
          width={sizes[tileSize]}
          backgroundColor={app.color || '#F2F3EF'}
        >
          <img
            draggable="false"
            height={sizes[tileSize]}
            width={sizes[tileSize]}
            key={app.title}
            src={app.image}
          />
          {title}
        </TileStyle>
      ) : (
        <TileStyle
          whileHover={{ scale: 1 + scales[tileSize] / 2 }}
          whileTap={{ scale: 1 - scales[tileSize] }}
          transition={{ scale: 0.5 }}
          minWidth={sizes[tileSize]}
          style={{ borderRadius: radius[tileSize] }}
          key={app.title}
          backgroundColor={app.color}
          height={sizes[tileSize]}
          width={sizes[tileSize]}
          // onClick={() => onAppClick(app)}
        >
          {title}
        </TileStyle>
      )}
      {selected && (
        <TileHighlight layoutId="active-app" transition={{ duration: 0.2 }} />
      )}
      <Menu
        customBg={app.color!}
        style={{
          top: anchorPoint && anchorPoint.y + 8,
          left: anchorPoint && anchorPoint.x + 10,
          visibility: show ? 'visible' : 'hidden',
          width: menuWidth,
        }}
        isOpen={show}
        onClose={() => {
          setShow(false);
        }}
      >
        <MenuItem
          label="Pin app"
          customBg={app.color}
          onClick={() => {
            // console.log('do reset form');
          }}
        />
        <MenuItem
          label="Remove ship"
          customBg={app.color}
          mt={1}
          onClick={() => {
            // authStore.removeShip(pendingShip.patp);
            // authStore.clearSession();
          }}
        />
      </Menu>
    </Flex>
  );
};

AppTile.defaultProps = {
  tileSize: 'md',
};

// <IconButton
//   size={26}
//   ref={optionsRef}
//   luminosity={themeStore.theme?.textTheme}
//   opacity={1}
//   onClick={(evt: any) => {
//     evt.preventDefault();
//     evt.currentTarget.blur();
//     !show && setShow && setShow(true);
//   }}
// >
//   <Icons name="Settings5Line" />
// </IconButton>
// <Menu
//   id={`${pendingShip.patp}-user-menu`}
//   customBg={themeStore.theme.windowColor}
//   style={{
//     top: anchorPoint && anchorPoint.y + 8,
//     left: anchorPoint && anchorPoint.x + 10,
//     visibility: show ? 'visible' : 'hidden',
//     width: menuWidth,
//   }}
//   isOpen={show}
//   onClose={() => {
//     setShow(false);
//   }}
// >
//   <MenuItem
//     label="Reset password"
//     customBg={themeStore.theme.windowColor}
//     onClick={() => {
//       console.log('do reset form');
//     }}
//   />
//   <MenuItem
//     label="Remove ship"
//     customBg={themeStore.theme.windowColor}
//     mt={1}
//     onClick={() => {
//       authStore.removeShip(pendingShip.patp);
//       authStore.clearSession();
//     }}
//   />
// </Menu>
