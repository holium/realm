import { FC, createRef, useMemo } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten } from 'polished';

import { useShip, useMst } from '../../../../../../../../logic/store';
import { Flex, Pulser, Divider } from '../../../../../../../../components';
import { TrayButton } from '../../TrayButton';
import { TrayMenu } from '../../TrayMenu';
import { MiniApp } from '../../MiniAppWindow';
import { Spaces } from '../../../../../../../apps/Spaces';
import { SelectedSpace } from './SelectedSpace';

type SpaceSelectorProps = {};

export const SpaceSelector: FC<SpaceSelectorProps> = observer(
  (props: SpaceSelectorProps) => {
    const { shipLoader } = useShip();
    const { themeStore } = useMst();
    const theme = themeStore.theme;
    const selectorRef = createRef<HTMLDivElement>();
    const appRef = createRef<HTMLDivElement>();

    const { windowColor, dockColor, textColor } = theme;
    const dividerBg = useMemo(
      () => rgba(lighten(0.2, dockColor), 0.4),
      [theme]
    );

    const dimensions = {
      height: 500,
      width: 380,
    };

    return (
      <Flex className="realm-cursor-hover" alignItems="center">
        <TrayMenu
          id="spaces-tray"
          appRef={appRef}
          buttonRef={selectorRef}
          dimensions={dimensions}
          position="top-right"
          buttonOffset={{ x: 4, y: 18 }}
          content={
            <MiniApp
              id="spaces-tray-app"
              ref={appRef}
              dimensions={dimensions}
              backgroundColor={windowColor}
              textColor={textColor}
            >
              <Spaces theme={theme} dimensions={dimensions} />
            </MiniApp>
          }
        >
          {shipLoader.isLoaded ? (
            <SelectedSpace selectorRef={selectorRef} />
          ) : (
            <TrayButton
              id="spaces-tray-icon"
              ref={selectorRef}
              whileTap={{ scale: 0.975 }}
              transition={{ scale: 0.2 }}
              customBg={dockColor}
            >
              <Flex>
                <Pulser
                  background={rgba(theme.backgroundColor, 0.5)}
                  borderRadius={4}
                  height={28}
                  width={28}
                />
              </Flex>
              <Flex
                style={{ pointerEvents: 'none' }}
                // mt="2px"
                flexDirection="column"
                justifyContent="center"
              >
                <Pulser
                  style={{ marginBottom: 2 }}
                  background={rgba(theme.backgroundColor, 0.5)}
                  borderRadius={4}
                  height={12}
                  width={40}
                />
                <Pulser
                  background={rgba(theme.backgroundColor, 0.5)}
                  borderRadius={4}
                  height={14}
                  width={90}
                />
              </Flex>
            </TrayButton>
          )}
        </TrayMenu>
        {shipLoader.isLoaded && <Divider customBg={dividerBg} ml={2} mr={2} />}
      </Flex>
    );
  }
);

export default { SpaceSelector };
