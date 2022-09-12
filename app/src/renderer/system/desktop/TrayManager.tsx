import { FC, createRef, useMemo, useRef } from 'react';
import { rgba } from 'polished';
import { TrayAppKeys, useTrayApps } from 'renderer/apps/store';
import { observer } from 'mobx-react';
import { trayAppRenderers } from './components/SystemBar/apps';
import { useServices } from 'renderer/logic/store';
import { TrayMenu } from './components/SystemBar/components/TrayMenu';
import { MiniApp } from './components/SystemBar/components/MiniAppWindow';

type TrayManagerProps = {};

export const TrayManager: FC<TrayManagerProps> = observer(
  (props: TrayManagerProps) => {
    const { desktop } = useServices();
    let trayAppRef: any;

    const { windowColor, textColor } = desktop.theme;
    const { activeApp, dimensions, coords } = useTrayApps();

    let TrayAppView: FC<any> | undefined;
    if (activeApp) {
      TrayAppView = trayAppRenderers[activeApp]!.component!;
      trayAppRef = createRef<HTMLDivElement>();
    }

    return useMemo(
      () =>
        TrayAppView ? (
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
        ) : null,
      [TrayAppView, activeApp, coords, dimensions]
    );
  }
);

export default { TrayManager };
