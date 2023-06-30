import { useEffect } from 'react';
import { Layer, ViewPort } from 'react-spaces';
import { observer } from 'mobx-react';

import { ConnectionStatus } from '@holium/design-system';

import { ConduitState } from 'os/services/api';
import { useAppState } from 'renderer/stores/app.store';
import { RealmIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';

import { RoomsStoreProvider } from '../Rooms/store/RoomsStoreProvider';
import { StandaloneChatBody } from './StandaloneChatBody';

export const StandaloneChatPresenter = () => {
  const { loggedInAccount, theme, connectionStatus } = useAppState();
  const { spacesStore } = useShipStore();

  useEffect(() => {
    // Standalone chat defaults to personal space.
    const ourSpace = `/${window.ship}/our`;
    spacesStore.selectSpace(ourSpace);
  }, []);

  if (!loggedInAccount) return null;

  return (
    <RoomsStoreProvider ourId={loggedInAccount.serverId}>
      <ViewPort>
        <Layer zIndex={20}>
          <ConnectionStatus
            serverId={loggedInAccount?.serverId || ''}
            themeMode={theme.mode as 'light' | 'dark'}
            status={connectionStatus as ConduitState}
            onReconnect={() => {
              console.log('reconnect');
              RealmIPC.reconnectConduit();
            }}
            onSendBugReport={() => {
              console.log('send bug report');
            }}
          />
        </Layer>
        <StandaloneChatBody />
      </ViewPort>
    </RoomsStoreProvider>
  );
};

export const StandaloneChat = observer(StandaloneChatPresenter);
