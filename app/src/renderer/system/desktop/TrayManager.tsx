import { useState } from 'react';
import { TrayAppKeys, useTrayApps } from 'renderer/apps/store';
import { observer } from 'mobx-react';
import { trayAppRenderers } from './components/SystemBar/apps';
import { TrayApp } from '@holium/design-system';
// import { TrayMenu } from './components/SystemBar/components/TrayMenu';
// import { MiniApp } from './components/SystemBar/components/MiniAppWindow';
import { WalletActions } from 'renderer/logic/actions/wallet';

const TrayManagerPresenter = () => {
  const { activeApp, coords, walletApp, dimensions, setActiveApp } =
    useTrayApps();
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
  const height = document.body.clientHeight;
  return (
    <TrayApp
      zIndex={100}
      id={activeApp as TrayAppKeys}
      coords={{
        x: coords.left,
        y: height - dimensions.height - coords.bottom,
        ...dimensions,
      }}
      closeTray={() => {
        setActiveApp(null);
      }}
    >
      {TrayAppView && <TrayAppView />}
    </TrayApp>
    // <TrayMenu
    //   id={activeApp as TrayAppKeys}
    //   coords={coords}
    //   body={
    //     <MiniApp id={`${activeApp}-app`} innerRef={trayAppRef}>
    //       {TrayAppView && <TrayAppView />}
    //     </MiniApp>
    //   }
    // />
  );
};

export const TrayManager = observer(TrayManagerPresenter);
