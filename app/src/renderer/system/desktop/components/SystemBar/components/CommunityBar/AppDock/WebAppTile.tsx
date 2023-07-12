import { Flex } from '@holium/design-system/general';
import { UseToggleHook } from '@holium/design-system/util';

type WebAppTileProps = {
  tileId: string;
  size: number;
  borderRadius: number;
  boxShadow?: string;
  backgroundColor: string;
  favicon: string | null;
  letter: string;
  children?: React.ReactNode;
  onFaultyFavicon: () => void;
  tapping: UseToggleHook;
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
  onFaultyFavicon,
  tapping,
}: WebAppTileProps) => {
  return (
    <Flex
      id={tileId}
      onTapStart={() => tapping.toggleOn()}
      onTapCancel={() => tapping.toggleOff()}
      onTap={() => tapping.toggleOff()}
      style={{
        position: 'relative',
        width: size,
        height: size,
        boxShadow,
        color: '#fff',
        borderRadius,
        backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {tapping.isOn && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            pointerEvents: 'none',
          }}
        />
      )}
      {favicon ? (
        <img
          alt="favicon"
          src={favicon}
          style={{
            width: '75%',
            height: '75%',
            borderRadius,
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
};
