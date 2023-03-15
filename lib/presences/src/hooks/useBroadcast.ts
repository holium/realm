import { useEffect } from 'react';

// Objects cannot be IPC'd.
export type PresenceArg = string | number | boolean | null | undefined;

type Props<T extends PresenceArg[]> = {
  onBroadcast: (...data: T) => void;
};

export const useBroadcast = <T extends PresenceArg[]>({
  onBroadcast,
}: Props<T>) => {
  useEffect(() => {
    window.electron.multiplayer.onRealmToAppBroadcast(onBroadcast);
  }, [onBroadcast]);

  const broadcast = (...data: T) => {
    window.electron.multiplayer.appToRealmBroadcast(...data);
  };

  return { broadcast };
};
