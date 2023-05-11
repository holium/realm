import { Flex } from '@holium/design-system/general';

type WebAppTileProps = {
  tileId: string;
  size: number;
  borderRadius: number;
  boxShadow?: string;
  backgroundColor: string;
  favicon: string | null;
  letter: string;
  children?: React.ReactNode;
  onClick: () => void;
  onFaultyFavicon: () => void;
};

export const WebAppTile = ({
  tileId,
  size,
  borderRadius,
  boxShadow,
  backgroundColor,
  favicon,
  letter,
  children,
  onClick,
  onFaultyFavicon,
}: WebAppTileProps) => (
  <Flex
    id={tileId}
    style={{
      position: 'relative',
      width: size,
      height: size,
      borderRadius,
      boxShadow,
      color: '#fff',
      backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
    }}
    onClick={onClick}
  >
    {favicon ? (
      <img
        alt="favicon"
        src={favicon}
        style={{
          width: '50%',
          height: '50%',
          borderRadius: 4,
          pointerEvents: 'none',
        }}
        onError={onFaultyFavicon}
      />
    ) : (
      letter
    )}
    {children}
  </Flex>
);
