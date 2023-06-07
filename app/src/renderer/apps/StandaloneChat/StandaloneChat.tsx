import { useEffect } from 'react';
import { ViewPort } from 'react-spaces';
import { observer } from 'mobx-react';

import { useShipStore } from 'renderer/stores/ship.store';

import { StandaloneChatBody } from './StandaloneChatBody';

export const StandaloneChatPresenter = () => {
  const { spacesStore } = useShipStore();

  useEffect(() => {
    // Standalone chat defaults to personal space.
    const ourSpace = `/${window.ship}/our`;
    spacesStore.selectSpace(ourSpace);
  });

  useEffect(() => {
    // Standalone chat uses the default OS cursor.
    window.electron.app.disableRealmCursor();
  });

  return (
    <ViewPort>
      <StandaloneChatBody />
    </ViewPort>
  );
};

export const StandaloneChat = observer(StandaloneChatPresenter);
