import { FC, useCallback } from 'react';
import { observer } from 'mobx-react';
import { rgba } from 'polished';

import { Flex, Pulser, Sigil } from 'renderer/components';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from 'renderer/logic/apps/store';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';

type AccountTrayProps = {
  theme: ThemeModelType;
};

export const AccountTray: FC<AccountTrayProps> = observer(
  (props: AccountTrayProps) => {
    const { theme } = props;
    const { ship } = useServices();
    const { activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
      useTrayApps();

    const dimensions = {
      height: 238,
      width: 350,
    };

    const position = 'top-left';
    // const anchorOffset = { x: 60, y: 26 };
    const anchorOffset = { x: 8, y: 26 };

    const onButtonClick = useCallback(
      (evt: any) => {
        if (activeApp === 'account-tray') {
          setActiveApp(null);
          evt.stopPropagation();
          return;
        }
        const { left, bottom }: any = calculateAnchorPoint(
          evt,
          anchorOffset,
          position,
          dimensions
        );
        setTrayAppCoords({
          left,
          bottom,
        });
        setTrayAppDimensions(dimensions);
        setActiveApp('account-tray');
      },
      [activeApp, anchorOffset, position, dimensions]
    );

    return (
      <Flex
        id="account-tray-icon"
        className="realm-cursor-hover"
        whileTap={{ scale: 0.95 }}
        transition={{ scale: 0.2 }}
        onClick={onButtonClick}
      >
        {ship ? (
          <Flex style={{ pointerEvents: 'none' }}>
            <Sigil
              simple
              size={28}
              avatar={ship.avatar}
              patp={ship.patp}
              color={[ship.color || '#000000', 'white']}
            />
          </Flex>
        ) : (
          <Flex>
            <Pulser
              background={rgba(theme.backgroundColor, 0.5)}
              borderRadius={4}
              height={28}
              width={28}
            />
          </Flex>
        )}
      </Flex>
    );
  }
);
