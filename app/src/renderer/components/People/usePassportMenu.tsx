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
import { Position } from '@holium/shared';

type PassportMenuOptions = {
  patp: string;
  sigilColor?: string | null;
  avatar?: string | null;
  nickname?: string | null;
  description?: string | null;
};

type PassportMenuConfig = {
  id: string;
  anchorPoint: Position;
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

const WIDTH = 340;
const MIN_HEIGHT = 130;

const calculateCoordinates = (config: PassportMenuConfig) => {
  const charactersPerLine = 42;
  const description = config.options.description ?? '';
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
                ...calculateCoordinates(menu),
                width: WIDTH,
                borderRadius: 9,
                minHeight: MIN_HEIGHT,
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
