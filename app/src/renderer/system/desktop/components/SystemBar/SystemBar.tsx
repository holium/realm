import { FC, createRef, useMemo } from 'react';
import { rgba } from 'polished';
import { Flex } from 'renderer/components';
import { HomeButton } from './components/HomeButton';
import { ShipTray } from './components/ShipBar';
import { CommunityBar } from './components/CommunityBar';
import { TrayAppKeys, useTrayApps } from 'renderer/logic/apps/store';
import { observer } from 'mobx-react';
import { trayAppRenderers } from './apps';
import { useServices } from 'renderer/logic/store';
import { TrayMenu } from './components/TrayMenu';
import { MiniApp } from './components/MiniAppWindow';

type SystemBarProps = {};

export const SystemBar: FC<SystemBarProps> = observer(
  (props: SystemBarProps) => {
    const { desktop } = useServices();
    let trayAppRef;

    const { windowColor, textColor } = desktop.theme;
    const { activeApp, dimensions, coords } = useTrayApps();

    let TrayAppView: FC<any> | undefined;
    if (activeApp) {
      TrayAppView = trayAppRenderers[activeApp]!.component!;
      trayAppRef = createRef<HTMLDivElement>();
    }

    // const { dockColor, textColor } = useMemo(
    //   () => ({
    //     ...desktop.theme,
    //     dockColor: rgba(desktop.theme.dockColor!, 0.55),
    //     textColor:
    //       desktop.theme.mode === 'light'
    //         ? rgba(desktop.theme.textColor!, 0.8)
    //         : desktop.theme.textColor!,
    //   }),
    //   [desktop.theme.dockColor]
    // );

    return (
      <>
        {TrayAppView && (
          <TrayMenu
            id={activeApp! as TrayAppKeys}
            coords={coords}
            dimensions={dimensions}
            content={
              <MiniApp
                id={`${activeApp}-app`}
                ref={trayAppRef}
                dimensions={dimensions}
                backgroundColor={windowColor}
                textColor={textColor}
              >
                <TrayAppView theme={desktop.theme} dimensions={dimensions} />
              </MiniApp>
            }
          />
        )}
        <Flex
          onContextMenu={(evt: any) => {
            evt.stopPropagation();
          }}
          gap={8}
          margin="8px"
          flexDirection="row"
        >
          <HomeButton />
          <CommunityBar />
          <ShipTray />
        </Flex>
      </>
    );
  }
);

export default { SystemBar };
