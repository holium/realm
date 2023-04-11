import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ThirdEarthShip } from '@holium/shared';
import { api } from './api';

interface IUserContext {
  token: string;
  email: string;
  ships: ThirdEarthShip[];
  selectedPatp: string;
  setSelectedPatp: (patp: string) => void;
}

const UserContext = createContext<IUserContext>(null as any);

type Props = {
  children: ReactNode;
};

export const UserContextProvider = ({ children }: Props) => {
  const [token, setToken] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [ships, setShips] = useState<ThirdEarthShip[]>([]);
  const [selectedPatp, setSelectedPatp] = useState<string>();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');

    if (!token || !email || ships.length) return;

    const getAndSetUserData = async () => {
      const newShips = await api.getUserShips(token);

      setToken(token);
      setEmail(email);
      setShips(newShips);
      setSelectedPatp(newShips[0].patp);
    };

    getAndSetUserData();
  }, []);

  if (!ships || !token || !email || !selectedPatp) return null;

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
