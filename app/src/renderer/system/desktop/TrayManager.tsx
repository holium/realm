import { FC, createRef, useMemo } from 'react';
import { TrayAppKeys, useTrayApps } from 'renderer/apps/store';
import { observer } from 'mobx-react';
import { trayAppRenderers } from './components/SystemBar/apps';
import { useServices } from 'renderer/logic/store';
import { TrayMenu } from './components/SystemBar/components/TrayMenu';
import { MiniApp } from './components/SystemBar/components/MiniAppWindow';

export const TrayManager: FC = observer(() => {
  const { theme } = useServices();
  let trayAppRef: any;

  const { windowColor, textColor } = theme.currentTheme;
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
              <TrayAppView theme={theme.currentTheme} dimensions={dimensions} />
            </MiniApp>
          }
        />
      ) : null,
    [TrayAppView, activeApp, coords, dimensions]
  );
});

export default { TrayManager };
