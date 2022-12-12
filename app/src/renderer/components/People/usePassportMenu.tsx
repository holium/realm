import { Box } from '@holium/design-system';
import { AnimatePresence } from 'framer-motion';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import { useServices } from 'renderer/logic/store';
import { Menu } from '../Menu';
import { PassportCard } from './PassportCard';

type AnchorPoint = { x: number; y: number };

type PassportMenuOptions = {
  patp: string;
  sigilColor?: string | null;
  avatar?: string | null;
  nickname?: string | null;
  description?: string | null;
};

type PassportMenuConfig = {
  id: string;
  anchorPoint: AnchorPoint;
  options: PassportMenuOptions;
};

type PassportMenuContextValue = {
  menuConfig: PassportMenuConfig | null;
  setMenuConfig: (config: PassportMenuConfig) => void;
};

const PassportMenuContext = createContext<PassportMenuContextValue>({} as any);

type PassportMenuProviderProps = {
  children: ReactNode;
};

const MENU_WIDTH = 340;

export const PassportMenuProvider = ({
  children,
}: PassportMenuProviderProps) => {
  const { theme } = useServices();
  const [menu, setMenu] = useState<PassportMenuConfig | null>(null);

  const setMenuConfig = useCallback((config: PassportMenuConfig) => {
    setMenu(config);
  }, []);

  return (
    <PassportMenuContext.Provider
      value={{
        menuConfig: menu,
        setMenuConfig,
      }}
    >
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 4,
        }}
      >
        <AnimatePresence>
          {menu && (
            <Menu
              customBg={theme.currentTheme.windowColor}
              style={{
                x: menu.anchorPoint && menu.anchorPoint.x - MENU_WIDTH - 6,
                y: menu.anchorPoint && menu.anchorPoint.y,
                width: MENU_WIDTH,
                borderRadius: 9,
                minHeight: 120,
                padding: 12,
              }}
              isOpen
              onClose={() => setMenu(null)}
            >
              <PassportCard
                {...menu.options}
                theme={theme.currentTheme}
                onClose={() => setMenu(null)}
              />
            </Menu>
          )}
        </AnimatePresence>
      </Box>
      {children}
    </PassportMenuContext.Provider>
  );
};

export const usePassportMenu = () => {
  const context = useContext(PassportMenuContext);
  return context;
};
