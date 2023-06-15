import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import { AnimatePresence } from 'framer-motion';

import { Box, Position } from '@holium/design-system';

import { Menu } from 'renderer/components/Menu/Menu';
import { useAppState } from 'renderer/stores/app.store';

import { PassportCard } from './PassportCard';

type PassportMenuContact = {
  patp: string;
  color?: string | null;
  avatar?: string | null;
  nickname?: string | null;
  bio?: string | null;
};

type PassportMenuConfig = {
  id: string;
  anchorPoint: Position;
  contact: PassportMenuContact;
};

type PassportMenuContextValue = {
  getMenuConfig: () => PassportMenuConfig | null;
  setMenuConfig: (config: PassportMenuConfig | null) => void;
};

const PassportMenuContext = createContext<PassportMenuContextValue>({} as any);

type PassportMenuProviderProps = {
  children: ReactNode;
};

const WIDTH = 340;
const MIN_HEIGHT = 130;

const calculateCoordinates = (config: PassportMenuConfig) => {
  const charactersPerLine = 42;
  const description = config.contact.bio ?? '';
  const numberOfLines = Math.ceil(description.length / charactersPerLine);
  const descriptionLineHeight = 17;
  const totalHeight = MIN_HEIGHT + descriptionLineHeight * numberOfLines;
  const willOverFlowBottom =
    config.anchorPoint.y + totalHeight > window.innerHeight - 58;

  return {
    x: config.anchorPoint.x - WIDTH - 6,
    y: willOverFlowBottom
      ? config.anchorPoint.y - totalHeight + 38
      : config.anchorPoint.y,
  };
};

export const PassportMenuProvider = ({
  children,
}: PassportMenuProviderProps) => {
  const { theme } = useAppState();
  const [menu, setMenu] = useState<PassportMenuConfig | null>(null);

  const setMenuConfig = useCallback((config: PassportMenuConfig | null) => {
    setMenu(config);
  }, []);

  const getMenuConfig = useCallback(() => menu, [menu]);

  return (
    <PassportMenuContext.Provider
      value={{
        getMenuConfig,
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
              customBg={theme.windowColor}
              style={{
                ...calculateCoordinates(menu),
                width: WIDTH,
                borderRadius: 9,
                minHeight: MIN_HEIGHT,
                padding: 12,
              }}
              isOpen
              onClose={() => setMenu(null)}
            >
              <PassportCard {...menu.contact} onClose={() => setMenu(null)} />
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
