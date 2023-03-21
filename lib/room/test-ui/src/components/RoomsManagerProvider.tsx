import {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useContext,
} from 'react';
import Urbit from '@urbit/http-api';
import {
  APIHandlers,
  ProtocolConfig,
  RealmProtocol,
  RoomsManager,
  ShipConfig,
} from '@holium/realm-room';

const testProtocolConfig: ProtocolConfig = {
  rtc: {
    iceServers: [{ urls: ['stun:coturn.holium.live:3478'] }],
    iceTransportPolicy: 'relay',
  },
};

type RealmMultiplayerContextState = {
  ship: ShipConfig;
  roomsManager: RoomsManager | null;
};

const RealmMultiplayerContext = createContext<RealmMultiplayerContextState>(
  {} as any
);

type Props = {
  ship: ShipConfig;
  children: ReactNode;
};

export const RoomsManagerProvider = ({ ship, children }: Props) => {
  const [roomsManager, setRoomsManager] = useState<RoomsManager | null>(null);

  useEffect(() => {
    let api: Urbit | null = null;

    Urbit.authenticate(ship).then(async (newApi) => {
      api = newApi;
      await newApi.connect();
      const handlers: APIHandlers = {
        poke: newApi.poke.bind(newApi),
        scry: newApi.scry.bind(newApi),
      };
      const protocol = new RealmProtocol(
        `~${ship.ship}`,
        testProtocolConfig,
        handlers
      );

      const newroomsManager = new RoomsManager(protocol);
      setRoomsManager(newroomsManager);

      newApi.subscribe({
        app: 'rooms-v2',
        path: '/lib',
        event: (data: any, mark: any) => {
          (newroomsManager.protocol as RealmProtocol).onSignal(data, mark);
        },
      });
    });

    return () => {
      api?.delete();
    };
  }, []);

  return (
    <RealmMultiplayerContext.Provider value={{ ship, roomsManager }}>
      {children}
    </RealmMultiplayerContext.Provider>
  );
};

export const useRoomsManager = () => useContext(RealmMultiplayerContext);
