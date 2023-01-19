import { useRef, useState } from 'react';
import { TrayAppKeys, useTrayApps } from 'renderer/apps/store';
import { observer } from 'mobx-react';
import { trayAppRenderers } from './components/SystemBar/apps';
import { TrayMenu } from './components/SystemBar/components/TrayMenu';
import { MiniApp } from './components/SystemBar/components/MiniAppWindow';
import { WalletActions } from 'renderer/logic/actions/wallet';

export const TrayManager = observer(() => {
  const trayAppRef = useRef<HTMLDivElement>();
  const { windowColor, textColor } = theme.currentTheme;
  const { activeApp, coords, walletApp, setActiveApp } = useTrayApps();
  const [walletForceActive, setWalletForceActive] = useState(false);
  if (walletForceActive && activeApp !== 'wallet-tray') {
    WalletActions.setForceActive(false);
    setWalletForceActive(false);
  }
  if (walletApp.forceActive && !walletForceActive) {
    setWalletForceActive(true);
    setActiveApp('wallet-tray');
  }

  if (!activeApp) return null;

  const TrayAppView = trayAppRenderers[activeApp].component;

  return (
    <TrayMenu
      id={activeApp as TrayAppKeys}
      coords={coords}
      body={
        <MiniApp id={`${activeApp}-app`} innerRef={trayAppRef}>
          {TrayAppView && <TrayAppView />}
        </MiniApp>
      }
    />
  );
});

export default { TrayManager };
