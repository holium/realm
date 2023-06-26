import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  OnboardingStorage,
  ThirdEarthApi,
  ThirdEarthShip,
} from '@holium/shared';

interface IUserContext {
  token: string | null;
  email: string | null;
  ships: ThirdEarthShip[];
  selectedShipId: number | undefined;
  setSelectedShipId: (newId: number) => void;
  refetchShips: () => Promise<void>;
}

const UserContext = createContext<IUserContext>(null as any);

type Props = {
  api: ThirdEarthApi;
  children: ReactNode;
};

export const UserContextProvider = ({ api, children }: Props) => {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [ships, setShips] = useState<ThirdEarthShip[]>([]);
  const [selectedShipId, setSelectedShipId] = useState<number>();

  const refetchShips = async () => {
    if (!token) return;

    const newShips = await api.getUserShips(token);

    setShips(newShips ?? []);
  };

  useEffect(() => {
    const { token, email } = OnboardingStorage.get();

    if (!token || !email || ships.length) return;

    const getAndSetUserData = async () => {
      const newShips = await api.getUserShips(token);

      setToken(token);
      setEmail(email);
      setShips(newShips ?? []);
      setSelectedShipId(newShips[0]?.id);
    };

    getAndSetUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{
        token,
        email,
        ships,
        selectedShipId,
        setSelectedShipId,
        refetchShips,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
