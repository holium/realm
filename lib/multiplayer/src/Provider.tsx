import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { MultiplayerShipType, RealmMultiplayerInterface } from './types';

type RealmMultiplayerContextState = {
  ship: MultiplayerShipType;
  channel: string;
  api?: RealmMultiplayerInterface;
};

export const RealmMultiplayerContext =
  createContext<RealmMultiplayerContextState>({} as any);

export const RealmMultiplayerProvider = ({
  channel,
  api,
  ship,
  children,
}: PropsWithChildren<RealmMultiplayerContextState>) => {
  const [_api, setApi] = useState<RealmMultiplayerInterface | undefined>(api);

  useEffect(() => {
    if (!channel || channel === '') return;

    const _api = api || globalThis.realmMultiplayer;
    setApi(_api);

    try {
      if (!_api) throw new Error('realmMultiplayer api not preloaded');
      _api.init({ roomId: channel, ship });
    } catch (e) {
      console.error(e);
    }

    return () => {
      _api?.close();
    };
  }, [channel]);

  return (
    <RealmMultiplayerContext.Provider value={{ channel, ship, api: _api }}>
      {children}
    </RealmMultiplayerContext.Provider>
  );
};

export const useRealmMultiplayer = () => useContext(RealmMultiplayerContext);
