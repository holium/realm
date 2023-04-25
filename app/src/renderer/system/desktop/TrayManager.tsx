import { TrayApp } from '@holium/design-system';
import { observer } from 'mobx-react';
import { TrayAppKeys, useTrayApps } from 'renderer/apps/store';

import { ErrorBoundary } from '../ErrorBoundary';

import { trayAppRenderers } from './components/SystemBar/apps';

const TrayManagerPresenter = () => {
  // const { activeApp, coords, walletApp, dimensions, setActiveApp } =
  //   useTrayApps();
  const { activeApp, coords, dimensions, setActiveApp } = useTrayApps();
  // const [walletForceActive, setWalletForceActive] = useState(false);

  // if (walletForceActive && activeApp !== 'wallet-tray') {
  //   // WalletActions.setForceActive(false);
  //   setWalletForceActive(false);
  // }
  // if (walletApp.forceActive && !walletForceActive) {
  //   setWalletForceActive(true);
  //   setActiveApp('wallet-tray');
  // }

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
        height: dimensions.height,
        width: dimensions.width,
      }}
      closeTray={() => setActiveApp(null)}
    >
      <ErrorBoundary>{TrayAppView && <TrayAppView />}</ErrorBoundary>
    </TrayApp>
  );
};

export const TrayManager = observer(TrayManagerPresenter);
