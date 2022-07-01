import { FC, createRef, useMemo } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten } from 'polished';

import { Flex, Pulser, Divider } from 'renderer/components';
import { TrayButton } from '../../TrayButton';
import { TrayMenu } from '../../TrayMenu';
import { MiniApp } from '../../MiniAppWindow';
import { Spaces } from 'renderer/apps/Spaces';
import { SelectedSpace } from './SelectedSpace';
import { useServices } from 'renderer/logic/store';

type SpaceSelectorProps = {};

export const SpaceSelector: FC<SpaceSelectorProps> = observer(
  (props: SpaceSelectorProps) => {
    const { ship, spaces, shell } = useServices();
    const { desktop } = shell;
    const selectorRef = createRef<HTMLDivElement>();
    const appRef = createRef<HTMLDivElement>();

    const { windowColor, dockColor, textColor } = desktop.theme;
    const dividerBg = useMemo(
      () => rgba(lighten(0.2, dockColor), 0.3),
      [desktop.theme]
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
              <Spaces theme={desktop.theme} dimensions={dimensions} />
            </MiniApp>
          }
        >
          {spaces.isLoaded ? (
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
                  background={rgba(desktop.theme.backgroundColor, 0.5)}
                  borderRadius={4}
                  height={28}
                  width={28}
                />
              </Flex>
              <Flex
                style={{ pointerEvents: 'none' }}
                flexDirection="column"
                justifyContent="center"
              >
                <Pulser
                  style={{ marginBottom: 2 }}
                  background={rgba(desktop.theme.backgroundColor, 0.5)}
                  borderRadius={4}
                  height={12}
                  width={40}
                />
                <Pulser
                  background={rgba(desktop.theme.backgroundColor, 0.5)}
                  borderRadius={4}
                  height={14}
                  width={90}
                />
              </Flex>
            </TrayButton>
          )}
        </TrayMenu>
        {ship && <Divider customBg={dividerBg} ml={2} mr={2} />}
      </Flex>
    );
  }
);

export default { SpaceSelector };
