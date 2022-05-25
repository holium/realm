import { FC, useRef, useState } from 'react';
import styled from 'styled-components';
import { lighten, rgba } from 'polished';
import { Flex, Box, Text } from '..';
import { AppModelType } from '../../../core/ship/stores/docket';
import { toJS } from 'mobx';
import { bgIsLightOrDark } from 'core/theme/lib';
import Icons from '../Icons';

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
  sm: 0.05,
  md: 0.05,
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
  onAppClick: (app: AppModelType) => void;
  selected?: boolean;
  app: AppModelType;
  variants?: any;
  isVisible?: boolean;
  tileSize: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

export const AppTile: FC<AppTileProps> = (props: AppTileProps) => {
  const { app, variants, selected, tileSize, onAppClick } = props;
  const tileRef = useRef(null);

  const isAppGrid = tileSize === 'xxl';
  const boxShadowStyle = isAppGrid ? '0px 0px 4px rgba(0, 0, 0, 0.06)' : 'none';
  // TODO fix app types
  let title;
  if (isAppGrid) {
    // @ts-ignore
    const lightOrDark: 'light' | 'dark' = bgIsLightOrDark(app.color);
    const isLight = lightOrDark === 'light';
    title = (
      <Text
        position="absolute"
        style={{ mixBlendMode: 'hard-light' }}
        left="1.7rem"
        bottom="1.7rem"
        fontWeight={500}
        fontSize={2}
        color={isLight ? rgba('#333333', 0.8) : rgba('#FFFFFF', 0.8)}
      >
        {app.title}
      </Text>
    );
  }

  // set image or icon
  let graphic;
  if (app.image) {
    graphic = (
      <TileStyle
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
    graphic = (
      <TileStyle
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
        <Icons
          name={app.icon}
          height={sizes[tileSize] / 3}
          width={sizes[tileSize] / 3}
        />
        {title}
      </TileStyle>
    );
  } else {
    graphic = (
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
      {graphic}
      {/* {app.image ? (
        <TileStyle
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
      )} */}
      {selected && (
        <TileHighlight layoutId="active-app" transition={{ duration: 0.2 }} />
      )}
    </Flex>
  );
};

AppTile.defaultProps = {
  tileSize: 'md',
};
