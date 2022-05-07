import { FC, useContext } from 'react';
import styled from 'styled-components';
import { lighten } from 'polished';
import { Flex, Box } from '../../../../../../../../components';
import { AppModelType } from '../../../../../../../../../core/ship/stores/docket';
import { useMst } from '../../../../../../../../logic/store';
import { toJS } from 'mobx';

const sizes = {
  sm: 32,
  md: 48,
  lg: 88,
  xl: 148,
};

const radius = {
  sm: 4,
  md: 12,
  lg: 20,
  xl: 24,
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
  cursor: pointer;
  user-select: none;
  transform: translateZ(0);
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
  tileSize: 'sm' | 'md' | 'lg' | 'xl';
}

export const AppTile: FC<AppTileProps> = (props: AppTileProps) => {
  const { app, selected, tileSize, onAppClick } = props;
  const { desktopStore } = useMst();
  // const { openNewWindow } = useContext(WinManagerContext);

  return (
    <Flex position="relative">
      {app.image ? (
        <TileStyle
          whileTap={{ scale: 0.9 }}
          transition={{ scale: 0.2 }}
          minWidth={sizes[tileSize]}
          style={{ borderRadius: radius[tileSize], overflow: 'hidden' }}
          height={sizes[tileSize]}
          width={sizes[tileSize]}
          backgroundColor={app.color || '#F2F3EF'}
          onClick={() => onAppClick(app)}
        >
          <img
            height={sizes[tileSize]}
            width={sizes[tileSize]}
            key={app.title}
            src={app.image}
          />
        </TileStyle>
      ) : (
        <TileStyle
          whileTap={{ scale: 0.9 }}
          transition={{ scale: 0.2 }}
          minWidth={sizes[tileSize]}
          style={{ borderRadius: radius[tileSize] }}
          key={app.title}
          backgroundColor={app.color}
          height={sizes[tileSize]}
          width={sizes[tileSize]}
          onClick={() => onAppClick(app)}
        ></TileStyle>
      )}
      {selected && (
        <TileHighlight layoutId="active-app" transition={{ duration: 0.2 }} />
      )}
    </Flex>
  );
};

AppTile.defaultProps = {
  tileSize: 'md',
};
