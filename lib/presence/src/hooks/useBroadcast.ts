import { useEffect } from 'react';

// Objects cannot be IPC'd.
export type PresenceArg = string | number | boolean | null | undefined;

type Props<T extends PresenceArg[]> = {
  channelId: string;
  onBroadcast: (...data: T) => void;
};

export const useBroadcast = <T extends PresenceArg[]>({
  channelId,
  onBroadcast,
}: Props<T>) => {
  useEffect(() => {
    window.electron.multiplayer.onRealmToAppBroadcast<T>((id, ...data) => {
      if (id === channelId) onBroadcast(...data);
    });
  }, [onBroadcast]);

  const broadcast = (...data: T) => {
    window.electron.multiplayer.appToRealmBroadcast(channelId, ...data);
  };

  return { broadcast };
};
