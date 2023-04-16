import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ThirdEarthShip } from '@holium/shared';
import { thirdEarthApi } from './thirdEarthApi';

interface IUserContext {
  token: string | null;
  email: string | null;
  ships: ThirdEarthShip[];
  selectedPatp: string;
  setSelectedPatp: (patp: string) => void;
}

const UserContext = createContext<IUserContext>(null as any);

type Props = {
  children: ReactNode;
};

export const UserContextProvider = ({ children }: Props) => {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [ships, setShips] = useState<ThirdEarthShip[]>([]);
  const [selectedPatp, setSelectedPatp] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');

    if (!token || !email || ships.length) return;

    const getAndSetUserData = async () => {
      const newShips = await thirdEarthApi.getUserShips(token);

      setToken(token);
      setEmail(email);
      setShips(newShips ?? []);
      setSelectedPatp(newShips[0]?.patp ?? '');
    };

    getAndSetUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{
        token,
        email,
        ships,
        selectedPatp,
        setSelectedPatp,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
